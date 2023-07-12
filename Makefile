build_dir_firefox := './build/firefox'
build_dir_chromium := './build/chromium'

all: firefox chromium

firefox:
	@echo "=> Building Firefox extension"
	rm -rf $(build_dir_firefox)
	mkdir -p $(build_dir_firefox)
	# Static files
	cp index.html $(build_dir_firefox)
	cp -r images $(build_dir_firefox)
	cp -r css $(build_dir_firefox)
	cp -r js $(build_dir_firefox)
	# Replace chrome with browser
	sed -i 's/chrome/browser/g' $(build_dir_firefox)/js/*
	# Copy v2 Manifest
	cp manifest_v2.json $(build_dir_firefox)/manifest.json
	@echo "======================"
	@echo "Firefox build complete"
chromium:
	@echo "=> Building Chromium extension"
	rm -rf $(build_dir_chromium)
	mkdir -p $(build_dir_chromium)
	# Static files
	cp index.html $(build_dir_chromium)
	cp -r images $(build_dir_chromium)
	cp -r css $(build_dir_chromium)
	cp -r js $(build_dir_chromium)
	# Copy v3 Manifest + Rules
	cp manifest_v3.json $(build_dir_chromium)/manifest.json
	cp rules_v3.json $(build_dir_chromium)/rules.json
	@echo "======================="
	@echo "Chromium build complete"

clean: 
	@echo "=> Cleaning up"
	rm -rf $(build_dir_firefox)
	rm -rf $(build_dir_chromium)
	@echo "======================="
	@echo "Cleanup complete"


