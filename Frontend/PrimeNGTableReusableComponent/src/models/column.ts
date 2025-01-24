// this.allowedRowsPerPage = responseData.allowedItemsPerPage; // Update the number of rows allowed per page
// this.currentRowsPerPage = Math.min(...this.allowedRowsPerPage); // Update the current rows per page to use the minimum value of allowed rows per page by default
// this.columns = responseData.columnsInfo; // Update columns with fetched data
// this.columnsNonSelectable = this.columns.filter((col: any) => !col.canBeHidden); // Filter columns that cannot be hidden
// this.columnsSelected = this.columns.filter((col: any) => !col.startHidden && col.canBeHidden); // Selected columns that are not hidden by default
// this.columnsToShow = this.orderColumnsWithFrozens(this.columnsNonSelectable.concat(this.columnsSelected));
// this.dateFormat = responseData.dateFormat;
// this.dateTimezone = responseData.dateTimezone;
// this.dateCulture = responseData.dateCulture;
// this.currentPage = 0;
export interface ColumnDataDTO {
    allowedRowsPerPage: number[];
    allowedItemsPerPage: number[];
    columnsInfo: any[];
    dateFormat: string;
    dateTimezone: string;
    dateCulture: string;
    currentPage: number;
}
