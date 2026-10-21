const STORAGE_KEY = "url-shortener-mappings";

function generateId() {
    return crypto.randomUUID().replaceAll("-", "").slice(0, 8);
}

class UrlDb {
    static #urlMappings = new Map(
        JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    );

    static #idMappings = (function (entries) {
        for (const element of entries) {
            [element[1], element[0]] = [...element];
        }
        return new Map(entries);
    })([...this.#urlMappings.entries()]);

    static get urlMap() {
        return this.#urlMappings;
    }

    static get idMap() {
        return this.#idMappings;
    }

    static save(url) {
        let id;
        while (this.#idMappings.has((id = generateId())));
        this.#idMappings.set(id, url);
        this.#urlMappings.set(url, id);
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([...this.#urlMappings.entries()])
        );
        return id;
    }
}

export class UrlModel {
    findById(id) {
        return UrlDb.idMap.get(id);
    }

    validateUrl(candidateUrl) {
        let url;

        try {
            url = new URL(candidateUrl);
        } catch {
            throw new Error("Please enter a valid URL.");
        }

        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("Only HTTP and HTTPS URLs are supported.");
        }

        return url.href;
    }

    createShortUrl(url, baseUrl) {
        return Object.assign(
            new URL(baseUrl),
            {
                hash: "",
                search: "",
                pathname: UrlDb.urlMap.get(url)
                    ?? UrlDb.save(this.validateUrl(url))
            }
        ).href;
    }
}
