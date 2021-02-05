export type UMAContractName =
    | "Timer"
    | "VotingToken"
    | "IdentifierWhitelist"
    | "Finder"
    | "Voting"
    | "Registry"
    | "FinancialContractAdmin"
    | "Store"
    | "Governor"
    | "DesignatedVotingFactory"
    | "TokenFactory"
    | "AddressWhitelist"
    | "ExpiringMultiPartyCreator"
    | "TestnetErc20Address"
    | "ExpiringMultiParty"
    | "SynthethicToken"

export type Bytes20 = string

export type EthereumAddress = Bytes20

export enum InterfaceName {
    FinancialContractsAdmin = "FinancialContractsAdmin",
    Oracle = "Oracle",
    Registry = "Registry",
    Store = "Store",
    IdentifierWhitelist = "IdentifierWhitelist",
    CollateralWhitelist = "CollateralWhitelist",
}