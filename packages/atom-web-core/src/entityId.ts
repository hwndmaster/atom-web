declare const brand: unique symbol;

type EntityIntId<T extends string | undefined = undefined> = number & { readonly [brand]: T };
type EntityGuidId<T extends string | undefined = undefined> = string & { readonly [brand]: T };

export type { EntityIntId, EntityGuidId };
