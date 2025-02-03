import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk";

import { ExtensionPreferences, gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class NoTimeForCautionPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const preferencesPage = new Adw.PreferencesPage();
    window.add(preferencesPage);

    const generalGroup = new Adw.PreferencesGroup({
      title: _("General Settings"),
    });
    preferencesPage.add(generalGroup);

    // Goal Time
    const goalTimeRow = new Adw.ActionRow({
      title: _("Goal Time"),
      subtitle: _("Enter in format: DD/MM/YYYY hh:mm"),
  });
  generalGroup.add(goalTimeRow);
  
  const goalTimeEntryBuffer = new Gtk.EntryBuffer();
  const goalTimeEntry = new Gtk.Entry({
      buffer: goalTimeEntryBuffer,
      placeholder_text: _("DD/MM/YYYY hh:mm"),
  });
  
  goalTimeRow.add_suffix(goalTimeEntry);
  goalTimeRow.set_activatable_widget(goalTimeEntry);
  
  // Load stored goal time and format it
  const storedTime = settings.get_int("goal-time");
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
          const dateTime = GLib.DateTime.new_local(year, month, day, hour, minute, 0).to_utc();
          const unixTimestamp = dateTime.to_unix();
          settings.set_int("goal-time", unixTimestamp);
      }
  });
  
    // Time Unit
    const timeUnitOptions = new Gtk.StringList();
    ["years", "months", "weeks", "days", "hours", "minutes", "seconds"].forEach((unit) => timeUnitOptions.append(_(unit)));

    const timeUnitRow = new Adw.ComboRow({
      title: _("Time Unit"),
      subtitle: _("Unit of time to display"),
      model: timeUnitOptions,
      selected: ["years", "months", "weeks", "days", "hours", "minutes", "seconds"].indexOf(settings.get_string("time-unit")),
    });
    timeUnitRow.connect("notify::selected", (row) => {
      settings.set_string("time-unit", ["years", "months", "weeks", "days", "hours", "minutes", "seconds"][row.selected]);
    });
    generalGroup.add(timeUnitRow);

    // Indicator Position
    const positionOptions = new Gtk.StringList();
    ["left", "center", "right"].forEach((pos) => positionOptions.append(_(pos)));

    const positionRow = new Adw.ComboRow({
      title: _("Indicator Position"),
      subtitle: _("Position of the indicator in the panel"),
      model: positionOptions,
      selected: ["left", "center", "right"].indexOf(settings.get_string("indicator-position")),
    });
    positionRow.connect("notify::selected", (row) => {
      settings.set_string("indicator-position", ["left", "center", "right"][row.selected]);
    });
    generalGroup.add(positionRow);

    // Indicator Index
    const indexRow = new Adw.ActionRow({
      title: _("Indicator Index"),
      subtitle: _("Index of the indicator in the panel"),
    });
    generalGroup.add(indexRow);

    const indexSpinButton = new Gtk.SpinButton({
      adjustment: new Gtk.Adjustment({ lower: 0, upper: 10, step_increment: 1 }),
      numeric: true,
      marginTop: 10,
      marginBottom: 10,
    });
    indexRow.add_suffix(indexSpinButton);
    indexRow.set_activatable_widget(indexSpinButton);

    settings.bind("indicator-index", indexSpinButton, "value", Gio.SettingsBindFlags.DEFAULT);
  }
}
