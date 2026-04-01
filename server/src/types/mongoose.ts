declare module "mongoose" {
    interface Query<ResultType, DocType, THelpers = {}, RawDocType = unknown, QueryOp = "find", TDocOverrides = Record<string, never>> {
        useCache: boolean;
        hashKey: string;
        cache(options?: { key?: string }): this;
    }
}

export {};
