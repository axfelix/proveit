# ProveIt
This is intended to eventually replace https://github.com/LibraryOfCongress/bagger, which has been called "effectively deprecated" (and who wants to use desktop Java at this point anyway). The main purpose is to be able to load and validate a bag, and edit some properties in a nice GUI, possibly according to a template. Screenshots forthcoming when it's closer to feature-complete.

## Development
```
$ pip install -r requirements.txt --user
$ cd gui
$ npm install
$ npm start
```

## Building
The Python code needs to be built on its target platform using `pyinstaller`:

`pyinstaller -w proveit.py --distpath gui`

After building the crawler, the GUI can be built from the `gui` subdirectory with:

`electron-packager . --icon=resources/icon.ico` (Windows)

`electron-packager . --icon=resources/icon.icns` (Mac)

Finally, to package for install:

`electron-installer-windows --src proveit-win32-x64/ --dest install/ --config config.json` (Windows)

`hdiutil create tmp.dmg -ov -volname "proveit" -fs HFS+ -srcfolder proveit-darwin-x64/ && hdiutil convert tmp.dmg -format UDZO -o proveit.dmg && rm tmp.dmg` (Mac)
