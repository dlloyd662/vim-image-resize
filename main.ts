import { MarkdownView, Plugin } from "obsidian";

enum ModifierKey {
  ALT = "AltLeft",
  CTRL = "ControlLeft",
  SHIFT = "ShiftLeft",
}
interface ImageResizeSettings {
  initialSize: number;
  modifierKey: ModifierKey;
  stepSize: number;
}

const DEFAULT_SETTINGS: ImageResizeSettings = {
  modifierKey: ModifierKey.ALT,
  stepSize: 25,
  initialSize: 500,
};

export default class ImageResizePlugin extends Plugin {
  settings: ImageResizeSettings;
  isKeyHeldDown = false;

  async onload() {
    await this.loadSettings();

    function resize(scale: number, activeLeaf: any) {
      if (activeLeaf && activeLeaf.view) {
        if (activeLeaf.view instanceof MarkdownView) {
          const cmEditor = activeLeaf.view.editor;
          const cursor = cmEditor.getCursor();
          const line = cmEditor.getLine(cursor.line);
          const regex = /\|(\d+)\]/;
          const match = line.match(regex);
          if (match) {
            const matchText = parseInt(match[1], 10);
            const newWidth = matchText + scale;
            if (newWidth < 50) {
              return;
            }

            cmEditor.setLine(cursor.line, line.replace(regex, `|${newWidth}]`));
          } else {
            const modifiedString = line.replace(/\]/, `|100]`);
            cmEditor.setLine(cursor.line, modifiedString);
          }
        }
      }
    }

    this.registerDomEvent(document, "keydown", (evt: KeyboardEvent) => {
      const activeLeaf = this.app.workspace.activeLeaf;
      if (evt.ctrlKey && evt.shiftKey && evt.key.toLocaleLowerCase() === "k") {
        resize(100, activeLeaf);
      } else if (
        evt.ctrlKey &&
        evt.shiftKey &&
        evt.key.toLocaleLowerCase() === "j"
      ) {
        resize(-100, activeLeaf);
      }
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  preventDefault(e: any) {
    e.preventDefault();
  }
}
