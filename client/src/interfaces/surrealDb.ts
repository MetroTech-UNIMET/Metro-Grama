export interface Id<TableName = string, IdType = string> {
    Table: TableName;
    ID: IdType;
}