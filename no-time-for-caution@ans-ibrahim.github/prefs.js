import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class NoTimeForCautionPreferences extends ExtensionPreferences {

  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const preferencesPage = new Adw.PreferencesPage({
      title: _("Settings"),
      icon_name: "preferences-system-symbolic",
    });
    window.add(preferencesPage);

    const goalGroup = new Adw.PreferencesGroup({
      title: _("Goal Configuration"),
      description: _("Set your target date and time"),
    });
    preferencesPage.add(goalGroup);

    const goalTimeRow = new Adw.ActionRow({
      title: _("Goal Time"),
      subtitle: _("Select your target date and time"),
    });
    goalGroup.add(goalTimeRow);

    const pickerContainer = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 16,
      valign: Gtk.Align.CENTER,
      height_request: 32, 
    });

    const dateButton = new Gtk.Button({
      label: _("Select Date"),
      css_classes: ["date-picker-button"],
      valign: Gtk.Align.CENTER,
    });

    const timeContainer = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 12,
      valign: Gtk.Align.CENTER,
      halign: Gtk.Align.START,
    });

    const hourSpin = new Gtk.SpinButton({
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: 23,
        step_increment: 1,
      }),
      numeric: true,
      digits: 0,
      width_chars: 2,
      css_classes: ["time-picker-spin"],
      valign: Gtk.Align.CENTER,
    });

    const minuteSpin = new Gtk.SpinButton({
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: 59,
        step_increment: 1,
      }),
      numeric: true,
      digits: 0,
      width_chars: 2,
      css_classes: ["time-picker-spin"],
      valign: Gtk.Align.CENTER,
    });

    timeContainer.append(hourSpin);
    timeContainer.append(minuteSpin);

    pickerContainer.append(dateButton);
    pickerContainer.append(timeContainer);

    const datePopover = new Gtk.Popover();
    const calendar = new Gtk.Calendar({
      show_day_names: true,
      show_heading: true,
      css_classes: ["date-picker-calendar"],
    });
    datePopover.set_child(calendar);
    datePopover.set_parent(dateButton);

    goalTimeRow.add_suffix(pickerContainer);
    goalTimeRow.set_activatable_widget(dateButton);

    goalTimeRow._datePopover = datePopover;
    goalTimeRow._calendar = calendar;
    goalTimeRow._hourSpin = hourSpin;
    goalTimeRow._minuteSpin = minuteSpin;

    const storedTime = settings.get_int64("goal-time");
    if (storedTime > 0) {
      const storedDate = GLib.DateTime.new_from_unix_local(storedTime);
      calendar.select_day(storedDate);
      hourSpin.set_value(storedDate.get_hour());
      minuteSpin.set_value(storedDate.get_minute());
      dateButton.label = storedDate.format("%d/%m/%Y");
    }

    dateButton.connect("clicked", () => {
      datePopover.popup();
    });

    const saveDateTime = () => {
      const selectedDate = calendar.get_date();
      if (!selectedDate) {
        return;
      }

      const year = selectedDate.get_year();
      const month = selectedDate.get_month();
      const day = selectedDate.get_day_of_month();
      const hour = hourSpin.get_value_as_int();
      const minute = minuteSpin.get_value_as_int();

      const localDateTime = GLib.DateTime.new_local(
        year,
        month,
        day,
        hour,
        minute,
        0
      );

      if (!localDateTime) {
        return;
      }

      dateButton.label = localDateTime.format("%d/%m/%Y");

      dateButton.add_css_class("success");

      GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        dateButton.remove_css_class("success");
        return GLib.SOURCE_REMOVE;
      });

      const unixTimestamp = localDateTime.to_utc().to_unix();
      settings.set_int64("goal-time", unixTimestamp);
    };

    calendar.connect("day-selected", saveDateTime);
    hourSpin.connect("value-changed", saveDateTime);
    minuteSpin.connect("value-changed", saveDateTime);

    const displayGroup = new Adw.PreferencesGroup({
      title: _("Display Settings"),
      description: _("Customize how the countdown is displayed"),
    });
    preferencesPage.add(displayGroup);

    const timeUnitOptions = new Gtk.StringList();
    ["years", "months", "weeks", "days", "hours", "minutes", "seconds"].forEach(
      (unit) => timeUnitOptions.append(_(unit))
    );

    const timeUnitRow = new Adw.ComboRow({
      title: _("Time Unit"),
      subtitle: _("Unit of time to display"),
      model: timeUnitOptions,
      selected: [
        "years",
        "months",
        "weeks",
        "days",
        "hours",
        "minutes",
        "seconds",
      ].indexOf(settings.get_string("time-unit")),
    });

    timeUnitRow.connect("notify::selected", (row) => {
      settings.set_string(
        "time-unit",
        ["years", "months", "weeks", "days", "hours", "minutes", "seconds"][
          row.selected
        ]
      );
    });
    displayGroup.add(timeUnitRow);

    const customTextRow = new Adw.ActionRow({
      title: _("Custom Text"),
      subtitle: _("Text to display after the time."),
    });
    displayGroup.add(customTextRow);

    const customTextEntryBuffer = new Gtk.EntryBuffer();
    const customTextEntry = new Gtk.Entry({
      buffer: customTextEntryBuffer,
      placeholder_text: _("e.g., till millionaire"),
      hexpand: true,
    });

    customTextRow.add_suffix(customTextEntry);
    customTextRow.set_activatable_widget(customTextEntry);

    const storedCustomText = settings.get_string("custom-text");
    if (storedCustomText) {
      customTextEntryBuffer.set_text(storedCustomText, -1);
    }

    customTextEntry.connect("changed", () => {
      const input = customTextEntryBuffer.get_text().trim();
      settings.set_string("custom-text", input);
    });

    const positionGroup = new Adw.PreferencesGroup({
      title: _("Panel Position"),
      description: _("Configure where the indicator appears in the panel"),
    });
    preferencesPage.add(positionGroup);

    const positionOptions = new Gtk.StringList();
    ["left", "center", "right"].forEach((pos) =>
      positionOptions.append(_(pos))
    );

    const positionRow = new Adw.ComboRow({
      title: _("Indicator Position"),
      subtitle: _("Position of the indicator in the panel"),
      model: positionOptions,
      selected: ["left", "center", "right"].indexOf(
        settings.get_string("indicator-position")
      ),
    });

    positionRow.connect("notify::selected", (row) => {
      settings.set_string(
        "indicator-position",
        ["left", "center", "right"][row.selected]
      );
    });

    positionGroup.add(positionRow);

    const indexRow = new Adw.ActionRow({
      title: _("Indicator Index"),
      subtitle: _("Index of the indicator in the panel"),
    });

    positionGroup.add(indexRow);

    const indexSpinButton = new Gtk.SpinButton({
      adjustment: new Gtk.Adjustment({
        lower: -10,
        upper: 10,
        step_increment: 1,
      }),
      numeric: true,
      digits: 0,
    });

    indexRow.add_suffix(indexSpinButton);
    indexRow.set_activatable_widget(indexSpinButton);

    settings.bind(
      "indicator-index",
      indexSpinButton,
      "value",
      Gio.SettingsBindFlags.DEFAULT
    );
  }
}
