# No Time For Caution

A GNOME Shell extension that displays a customizable countdown timer in the top panel. Perfect for tracking important deadlines, goals, or any time-sensitive events.

## Features

- **Customizable Countdown**: Set any target date and time
- **Flexible Time Units**: Display in years, months, weeks, days, hours, minutes, or seconds
- **Custom Text**: Personalize the display text (e.g., "till millionaire")
- **Panel Integration**: Clean integration with GNOME Shell's top panel
- **Real-time Updates**: Updates every second for accurate countdown

## Installation

### From GNOME Extensions

Install from [GNOME Shell extension page](https://extensions.gnome.org/extension/7845/no-time-for-caution/)

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/ans-ibrahim/no-time-for-caution.git
   cd no-time-for-caution
   ```

2. Build and install:
   ```bash
   make install
   ```

3. Restart GNOME Shell or log out and back in



## Usage

### Setting Up Your Countdown

1. Open GNOME Extensions app or use `gnome-extensions-app`
2. Find "No Time For Caution" and click the settings icon
3. Configure your countdown:
   - **Goal Time**: Enter your target date and time (DD/MM/YYYY hh:mm)
   - **Time Unit**: Choose how to display the countdown
   - **Custom Text**: Add your own text (e.g., "till billionaire")

### Example Configurations

- **Career Goal**: "1.2 Years till millionaire"
- **Vacation Countdown**: "23 Days until vacation"
- **Project Deadline**: "2.5 Weeks till project due"
- **Personal Goal**: "180 Days till marathon"

## Development

### Prerequisites

- GNOME Shell 45+
- `glib-compile-schemas`
- `zip` (for building)

### Build Commands

```bash
make build     # Build extension and create zip package
make install   # Build and install to user directory
make uninstall # Remove from user directory
make clean     # Clean build artifacts
make help      # Show available commands
```


## Configuration

The extension stores settings using GSettings with the following keys:

- `goal-time`: Unix timestamp of target date/time
- `time-unit`: Display unit (years, months, weeks, days, hours, minutes, seconds)
- `custom-text`: Custom text to append after time value
- `indicator-position`: Panel position (left, center, right)
- `indicator-index`: Panel index for ordering

## Troubleshooting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
