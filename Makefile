# Makefile for No Time For Caution GNOME Extension

# Extension details
EXTENSION_NAME = no-time-for-caution@ans-ibrahim.github
EXTENSION_DIR = $(EXTENSION_NAME)
BUILD_DIR = build
ZIP_NAME = $(EXTENSION_NAME).zip

# Installation path
USER_EXTENSIONS_DIR = $(HOME)/.local/share/gnome-shell/extensions

# Default target
all: install

# Compile schemas
compile-schemas:
	@echo "Compiling schemas..."
	glib-compile-schemas $(EXTENSION_DIR)/schemas/
	@echo "Schemas compiled successfully"

# Build the extension and create zip
build: compile-schemas
	@echo "Building extension..."
	mkdir -p $(BUILD_DIR)
	cd $(EXTENSION_DIR) && zip -r ../$(BUILD_DIR)/$(ZIP_NAME) *
	@echo "Extension built and zipped: $(BUILD_DIR)/$(ZIP_NAME)"

# Install to user directory
install: build
	@echo "Installing extension to user directory..."
	mkdir -p $(USER_EXTENSIONS_DIR)
	cd $(BUILD_DIR) && unzip -o $(ZIP_NAME) -d $(USER_EXTENSIONS_DIR)/$(EXTENSION_NAME)
	@echo "Extension installed to $(USER_EXTENSIONS_DIR)/$(EXTENSION_NAME)"
	@echo "Please restart GNOME Shell or log out and back in to enable the extension"

# Uninstall from user directory
uninstall:
	@echo "Uninstalling extension from user directory..."
	rm -rf $(USER_EXTENSIONS_DIR)/$(EXTENSION_NAME)
	@echo "Extension uninstalled from user directory"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	@echo "Clean complete"

# Show help
help:
	@echo "Available targets:"
	@echo "  build     - Build extension and create zip package"
	@echo "  install   - Build and install extension to user directory (default)"
	@echo "  uninstall - Uninstall extension from user directory"
	@echo "  clean     - Remove build artifacts"
	@echo "  help      - Show this help message"

.PHONY: all build install uninstall clean help compile-schemas 
