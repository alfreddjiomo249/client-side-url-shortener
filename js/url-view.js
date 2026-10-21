export class UrlView {
    #form;
    #urlInput;
    #copyButton;
    #pasteButton;
    #shortenButton;
    #shortUrlOutput;
    #message;
    #dialog;

    constructor() {
        this.#message = document.querySelector("p");
        this.#dialog = document.querySelector("dialog");
        if (this.isIndex()) {
            this.#form = document.querySelector("form[name=main]");
            this.#urlInput = document.querySelector("input");
            this.#copyButton = document.querySelector("button.copy");
            this.#pasteButton = document.querySelector("button.paste");
            this.#shortenButton = document.querySelector("button[type=submit]");
            this.#shortUrlOutput = document.querySelector("output");
        }
    }

    bindShorten(handler) {
        this.#form.addEventListener("submit", event => {
            event.preventDefault();
            handler(this.#urlInput.value.trim());
        });
    }

    bindCopy(handler) {
        this.#copyButton.addEventListener("click", () => {
            handler(this.#shortUrlOutput.textContent);
        });
    }

    bindPaste(handler) {
        this.#pasteButton.addEventListener("click", async () => {
            this.writeInput(await handler());
            this.focusInput();
            this.enableShortenButton();
            this.closeDialog();
        });
    }

    bindShowErrorStatus() {
        window.addEventListener("error", event => {
            this.showMessage(event.error.message, true);
        });
    }

    bindReset(handler) {
        this.#form.addEventListener("reset", () => {
            this.closeDialog();
            handler();
        });
    }

    bindUrlChanged(handler) {
        this.#urlInput.addEventListener("input", () => {
            handler(this.#urlInput.value);
        });
    }

    showShortUrl(url) {
        this.#shortUrlOutput.textContent = url;
    }

    clearShortUrl() {
        this.#shortUrlOutput.textContent = "";
    }

    showMessage(message, isError = false) {
        this.openDialog();
        const msg = this.#message;
        msg.classList.toggle("error", isError);
        msg.textContent = message;
        setTimeout(this.closeDialog.bind(this), 10000);
    }

    dispatchErrorEvent(message) {
        this.showMessage(message, true)
        throw new Error(message);
    }

    clearMessage() {
        this.showMessage("");
    }

    clearInput() {
        this.#urlInput.value = "";
    }

    writeInput(url) {
        this.#urlInput.value = url;
    }

    focusInput() {
        this.#urlInput.focus();
    }

    disableShortenButton() {
        this.#shortenButton.disabled = true;
    }

    enableShortenButton() {
        this.#shortenButton.disabled = false;
    }

    openDialog() {
        this.#dialog.show();
    }

    closeDialog() {
        this.#dialog.close();
    }

    isIndex() {
        return ["/", "/index.html"].includes(window.location.pathname);
    }
}
