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

    // Goal Time Group
    const goalGroup = new Adw.PreferencesGroup({
      title: _("Goal Configuration"),
      description: _("Set your target date and time"),
    });
    preferencesPage.add(goalGroup);

    // Goal Time
    const goalTimeRow = new Adw.ActionRow({
      title: _("Goal Time"),
      subtitle: _("Enter in format: DD/MM/YYYY hh:mm"),
    });
    goalGroup.add(goalTimeRow);

    const goalTimeEntryBuffer = new Gtk.EntryBuffer();
    const goalTimeEntry = new Gtk.Entry({
      buffer: goalTimeEntryBuffer,
      placeholder_text: _("DD/MM/YYYY hh:mm"),
      hexpand: true,
    });

    goalTimeRow.add_suffix(goalTimeEntry);
    goalTimeRow.set_activatable_widget(goalTimeEntry);

    // Load stored goal time and format it
    const storedTime = settings.get_int64("goal-time");
    if (storedTime > 0) {
      const storedDate = GLib.DateTime.new_from_unix_local(storedTime);
      goalTimeEntryBuffer.set_text(storedDate.format("%d/%m/%Y %H:%M"), -1);
    }

    // Validate and save input
    goalTimeEntry.connect("changed", () => {
      const input = goalTimeEntryBuffer.get_text().trim();
      const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
      const match = input.match(regex);

      if (match) {
        const [, day, month, year, hour, minute] = match.map(Number);
        
        // Validate date bounds to prevent crashes
        if (month < 1 || month > 12 || day < 1 || day > 31 || 
            hour < 0 || hour > 23 || minute < 0 || minute > 59 ||
            year < 1900 || year > 2100) {
          return; // Invalid date, don't save
        }
        
        try {
          const dateTime = GLib.DateTime.new_local(
            year,
            month,
            day,
            hour,
            minute,
            0
          );
          
          // Check if the date is valid (GLib will throw an error for invalid dates)
          if (dateTime) {
            const unixTimestamp = dateTime.to_utc().to_unix();
            settings.set_int64("goal-time", unixTimestamp);
          }
        } catch (error) {
          // Invalid date, don't save
          console.warn("Invalid date entered:", input);
        }
      }
    });

    // Display Settings Group
    const displayGroup = new Adw.PreferencesGroup({
      title: _("Display Settings"),
      description: _("Customize how the countdown is displayed"),
    });
    preferencesPage.add(displayGroup);

    // Time Unit
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

    // Custom Text
    const customTextRow = new Adw.ActionRow({
      title: _("Custom Text"),
      subtitle: _("Text to display after the time (e.g., 'till millionaire')"),
    });
    displayGroup.add(customTextRow);

    const customTextEntryBuffer = new Gtk.EntryBuffer();
    const customTextEntry = new Gtk.Entry({
      buffer: customTextEntryBuffer,
      placeholder_text: _("e.g., till billionaire"),
      hexpand: true,
    });

    customTextRow.add_suffix(customTextEntry);
    customTextRow.set_activatable_widget(customTextEntry);

    // Load stored custom text
    const storedCustomText = settings.get_string("custom-text");
    if (storedCustomText) {
      customTextEntryBuffer.set_text(storedCustomText, -1);
    }

    // Save custom text
    customTextEntry.connect("changed", () => {
      const input = customTextEntryBuffer.get_text().trim();
      settings.set_string("custom-text", input);
    });

    // Position Settings Group
    const positionGroup = new Adw.PreferencesGroup({
      title: _("Panel Position"),
      description: _("Configure where the indicator appears in the panel"),
    });
    preferencesPage.add(positionGroup);

    // Indicator Position
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

    // Indicator Index
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