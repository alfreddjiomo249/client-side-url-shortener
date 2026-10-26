const storage = new Proxy(localStorage, {
    STORAGE_KEY: "url-shortener-mappings",

    get(target, property) {
        if (!["getItem", "setItem"].includes(property)) return Reflect.get(...arguments);
        return target[property].bind(target, this.STORAGE_KEY);
    }
});

class BiMap extends Map {
    #reverse;

    constructor(entries = []) {
        super();
        this.#reverse = new Map;
        entries.forEach(([key, value]) => {
            this.set(key, value);
            this.#reverse.set(value, key);
        });
    }

    get reverse() {
        return this.#reverse;
    }

    set(key, value) {
        super.set(key, value);
        this.#reverse.set(value, key);
        return this;
    }
}

export default class UrlModel {
    #urls = new BiMap(JSON.parse(storage.getItem() ?? "[]"));

    findById(id) {
        return this.#urls.reverse.get(id);
    }

    createShortUrl(url, baseUrl) {
        return Object.assign(new URL(baseUrl), {
            hash: "",
            search: "",
            pathname: this.#urls.get(url) ?? this.#save(url)
        }).href;
    }

    #save(url) {
        let id;
        while (this.#urls.reverse.has((id = this.#generateId())));
        this.#urls.set(url, id);
        storage.setItem(JSON.stringify([...this.#urls.entries()]));
        return id;
    }

    #generateId() {
        return crypto.randomUUID().split("-")[0];
    }
}