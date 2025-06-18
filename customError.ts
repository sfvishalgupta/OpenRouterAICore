export class CustomError extends Error {
    constructor(
        public readonly code: string,
        public readonly message: string,
        private readonly additionalData?: any) {
        super(message);
        this.name = 'CustomError';
        this.additionalData = additionalData;
    }

    getAdditionalData(): any {
        return this.additionalData;
    }

    toString(): string {
        return `❌ ${this.name}: ${this.code} :${this.message}`;
    }
}