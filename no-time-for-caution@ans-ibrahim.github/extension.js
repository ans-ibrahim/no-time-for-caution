import GObject from "gi://GObject";
import St from "gi://St";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init(settings, extension) {
      super._init(0.5, _("No Time For Caution"));
      this.settings = settings;
      this._extension = extension;

      this.label = new St.Label({
        text: _("Calculating..."),
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.add_child(this.label);

      // Add settings menu item
      this._settingsItem = this.menu.addAction(_("Settings"), () => {
        this._extension.openPreferences();
      });

      this._updateCountdown();
      this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
        this._updateCountdown();
        return GLib.SOURCE_CONTINUE;
      });
    }

    _updateCountdown() {
      let goalUnix = this.settings.get_int64("goal-time");

      // Convert goal time to local time
      let goalLocal = GLib.DateTime.new_from_unix_utc(goalUnix);

      let now = GLib.DateTime.new_now_utc();

      // Calculate time difference
      let diff = goalLocal.to_unix() - now.to_unix();

      if (diff <= 0) {
        this.label.set_text("No Goal");
      } else {
        let unit = this.settings.get_string("time-unit");
        let customText = this.settings.get_string("custom-text");
        let timeString;

        switch (unit) {
          case "years":
            timeString = `${(diff / 31536000).toFixed(2)} Years ${customText}`;
            break;
          case "months":
            timeString = `${(diff / 2592000).toFixed(2)} Months ${customText}`;
            break;
          case "weeks":
            timeString = `${(diff / 604800).toFixed(2)} Weeks ${customText}`;
            break;
          case "days":
            timeString = `${(diff / 86400).toFixed(2)} Days ${customText}`;
            break;
          case "hours":
            timeString = `${(diff / 3600).toFixed(2)} Hours ${customText}`;
            break;
          case "minutes":
            timeString = `${(diff / 60).toFixed(2)} Minutes ${customText}`;
            break;
          case "seconds":
            timeString = `${diff} Seconds ${customText}`;
          default:
            timeString = `${diff} Seconds ${customText}`;
        }
        this.label.set_text(timeString);
      }
    }

    destroy() {
      if (this._timeout) {
        GLib.source_remove(this._timeout);
        this._timeout = null;
      }
      super.destroy();
    }
  }
);

export default class NoTimeForCautionExtension extends Extension {
  enable() {
    this.settings = this.getSettings();
    this._indicator = new Indicator(this.settings, this);
    Main.panel.addToStatusArea(
      "no-time-for-caution@ans-ibrahim.github",
      this._indicator,
      this.settings.get_int("indicator-index"),
      this.settings.get_string("indicator-position")
    );
    this.settings.connect("changed", () => {
      if (this._indicator) {
        this._indicator.destroy();
        this._indicator = null;
      }
      this._indicator = new Indicator(this.settings, this);
      Main.panel.addToStatusArea(
        "no-time-for-caution@ans-ibrahim.github",
        this._indicator,
        this.settings.get_int("indicator-index"),
        this.settings.get_string("indicator-position")
      );
    });
  }

  disable() {
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
    this.settings.disconnect("changed");
    this.settings = null;
  }
}