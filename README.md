## debacror

> Debuggable Action Recorder

### Status

> we will release the beta version soon in a few days.

![cover](cover.png)

---

Debacror is a web automation tool for developer. We want to design a debuggable action-record tool that fully depends on browser environment, and totally controllable like the native devtools. You can choose and edit the actions flow to execute, and combine them as you want.

Contribution is much appreciated. For more information about contribution, please refer to `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`

---

### Known issues

Because of the limitations of web apis(include chrome itself), there are some cases that debacror might won't work correctly which means it can't represent your actions 100% precisely. We are looking for better solutions all the time, so if you have any suggestions or bugs, just open an issue and then told us.

- when represent actions, for chinese characters, corresponding keyboard events will not be triggered, and input event will be triggered by per-character.
- for security reasons, some websites may won't response events fired by `debacror`
