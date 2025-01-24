import { Table } from 'primeng/table';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

// Import services
import { SharedService } from '../../services/shared/shared.service';
import { PrimengTableService } from '../../services/primeng-table/primengTable.service';

// Import interfaces
import { enumCellOverflowBehaviour, enumDataAlignHorizontal, enumDataAlignVertical, enumDataType, enumFrozenColumnAlign, IprimengColumnsMetadata } from '../../interfaces/primeng/iprimeng-columns-metadata';
import { IprimengTableDataPost, IprimengTableDataPostWithExport } from '../../interfaces/primeng/iprimeng-table-data-post';
import { IprimengTableDataReturn } from '../../interfaces/primeng/iprimeng-table-data-return';
import { IprimengColumnsAndAllowedPagination } from '../../interfaces/primeng/iprimeng-columns-and-allowed-pagination';
import { IprimengActionButtons } from '../../interfaces/primeng/iprimeng-action-buttons';
import { IPrimengPredifinedFilter } from '../../interfaces/primeng/iprimeng-predifined-filter';

// Import other
import { FilterMetadata, MenuItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { IPrimeNgViewData, IPrimeNgView } from '../../interfaces/primeng/iprimeng-views';
import { PrimengTableViewsService } from '../../services/primeng-table/primengTableViews.service';
import { Observable } from 'rxjs';

export enum enumTableViewSaveMode {
  noone,
  sessionStorage,
  localStorage,
  databaseStorage
}

@Component({
  selector: 'ecs-primeng-table-dataSource', // Component selector used in HTML to render this component
  templateUrl: './primeng-table-dataSource.component.html', // Path to the HTML template for this component
  styleUrls: ['./primeng-table-dataSource.component.scss']
})

export class PrimengTableSourceComponent {
  constructor(
    private primengTableService: PrimengTableService,
    private primengTableViewsService: PrimengTableViewsService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer) { }

  @Input() canPerformActions: boolean = true; // Used to avoid upon entering to perform the searchs. Its usefull when its needed to retrieve other values firsts and then call "updateDataExternal"
  @Input() globalSearchEnabled: boolean = true; // Used to enable or disable the global search (by default enabled)
  @Input() globalSearchMaxLength: number = 50; // The maximun number of characters that can be input in the global filter
  @Input() globalSearchPlaceholder: string = "Search keyword"; // The placeholder text to show if global search is enabled
  @Input() rowActionButtons: IprimengActionButtons[] = []; // A list that contains all buttons that will appear in the actions column
  @Input() headerActionButtons: IprimengActionButtons[] = []; // A list that contains all buttons that will appear in the right side of the header of the table
  // @Input() columnsSourceURL!: string; // The URL (without the base API URL) that will be used to fetch all the information related to the columns
  @Input() dataSource!: IprimengTableDataReturn;
  @Input() columnsSource!: IprimengColumnsAndAllowedPagination;
  // @Input() dataSoureURL!: string; // The URL (without the base API URL) that will be used to fetch all the information related to the data
  @Input() predifinedFiltersCollection: { [key: string]: IPrimengPredifinedFilter[] } = {}; // Contains a collection of the values that need to be shown for predifined column filters
  @Input() predifinedFiltersNoSelectionPlaceholder: string = "Any value"; // A text to be displayed in the dropdown if no value has been selected in a column that uses predifined filters
  @Input() predifinedFiltersCollectionSelectedValuesText: string = "items selected"; // A text to display in the predifined filters dropdown footer indicating the number of items that have been selected
  @Input() noDataFoundText: string = "No data found for the current filter criteria."; // The text to be shown when no data has been returned
  @Input() showingRecordsText: string = "Showing records"; // The text that must be displayed as part of "Showing records"
  @Input() applyingFiltersText: string = "Available records after applying filters"; // The text that is shown next to the number of records after applying filter rules
  @Input() notApplyingFiltersText: string = "Number of available records"; // The text to be shown next to the number of total records available (not applying filters)
  @Input() actionColumnName: string = "Actions" // The column name were the action buttons will appear
  @Input() actionsColumnWidth: number = 150; // The amount in pixels for the size of the actions column
  @Input() actionsColumnAligmentRight: boolean = true; // If actions column is put at the right end of the table (or false if its at the left)
  @Input() actionsColumnFrozen: boolean = true; // If the actions column should be frozen
  @Input() actionsColumnResizable: boolean = false; // If the action column can be resized by the user
  @Input() rowSelectorColumnActive: boolean = false; // By default false. If true, a column will be shown to the user that includes a checkbox per row. This selection and filtering that the user can do is all managed by the table component. You can fetch the selected rows through the output selectedRows.
  @Input() rowSelectorColumName: string = "Selected"; // The title of the row selection column. By default is "Selected"
  @Input() rowSelectorColumnWidth: number = 150; // The amount in pixels for the size of the selector column
  @Input() rowSelectorColumnAligmentRight: boolean = true; // By default true. If true, the row selector column is put at the right end of the table (or false if its at the left).
  @Input() rowSelectorColumnFrozen: boolean = true; // By default true. If true, the row selector column will be frozen.
  @Input() rowselectorColumnResizable: boolean = false;
  @Input() computeScrollHeight: boolean = true; // If true, the table will try not to grow more than the total height of the window vertically
  @Input() tableViewSaveAs: enumTableViewSaveMode = enumTableViewSaveMode.noone; // How the table view will be saved
  @Input() tableViewSaveKey: string = ""; // The key used to save the table views
  @Input() viewsGetSourceURL: string = "";
  @Input() viewsSaveSourceURL: string = "";
  @Input() maxTableViews: number = 10; // The maximun number of views that can be saved
  @Input() columnEditorShow: boolean = true; // If the column editor button must be shown or not
  @Input() copyCellDataToClipboardTimeSecs: number = 0.5; // The amount of time since mouse down in a cell for its content to be copied to the clipboard. If you want to disable this functionality, put it to a value less than or equal to 0.
  @Input() showClearSorts: boolean = true; // If the clear sorts button must be shown
  @Input() showClearFilters: boolean = true; // If the clear filters buttons must be shown
  @Input() showRefreshData: boolean = true; // If the refresh data button must be shown or not
  @Input() reportSourceURL: string | undefined; // The endpoint of the Excel report
  @Input() reportTitleDefault: string | undefined; // A default title for the Excel report
  @Input() reportIncludeTime: boolean = true; // If the current time should be added to the end of the report name
  @Input() reportTitleAllowUserEdit: boolean = false; // If the user is allowed to modify the title of the report

  @Output() selectedRowsChange = new EventEmitter<{
    rowID: any,
    selected: boolean
  }>(); // Emitter that returns the column selected and if it was selected or unselected

  selectedRows: any[] = []; // An array to keep all the selected rows

  @ViewChild('dt') dt!: Table; // Get the reference to the object table
  @ViewChild('dt_columnDialog') dt_columnDialog!: Table;

  enumDataType = enumDataType;
  enumCellOverflowBehaviour = enumCellOverflowBehaviour;
  enumDataAlignHorizontal = enumDataAlignHorizontal;
  enumDataAlignVertical = enumDataAlignVertical;
  enumFrozenColumnAlign = enumFrozenColumnAlign;
  enumTableViewSaveMode = enumTableViewSaveMode;

  scrollHeight: string = "0px";

  tableViews_menuItems: MenuItem[] = [];

  private tableViewsInit: boolean = false;
  tableViewsFirstFetchDone: boolean = false;
  tableViewsList: IPrimeNgView[] = [];
  newViewShowModal: boolean = false;
  newViewAlias: string = "";
  tableViewCurrentSelectedAlias: string | null = null;
  editingViewAlias: string = "";
  private copyCellDataTimer: any; // A timer that handles the amount of time left to copy the cell data to the clipboard
  private initialColumnWidths: any;
  private initialTableWidth: any;
  private getInitialWidths: boolean = true;
  cellOverflowBehaviourOptions = [
    { icon: 'pi pi-minus', val: enumCellOverflowBehaviour.Hidden },
    { icon: 'pi pi-equals', val: enumCellOverflowBehaviour.Wrap }/*,
    {icon: 'pi pi-ellipsis-h', val: enumCellOverflowBehaviour.Ellipsis}*/
  ];
  dataAlignHorizontalOptions = [
    { icon: 'pi pi-align-left', val: enumDataAlignHorizontal.Left },
    { icon: 'pi pi-align-center', val: enumDataAlignHorizontal.Center },
    { icon: 'pi pi-align-right', val: enumDataAlignHorizontal.Right }
  ];
  dataAlignVerticalOptions = [
    { icon: 'pi pi-angle-up', val: enumDataAlignVertical.Top },
    { icon: 'pi pi-align-justify', val: enumDataAlignVertical.Middle },
    { icon: 'pi pi-angle-down', val: enumDataAlignVertical.Bottom }
  ];

  exportToExcelOptions_allColumns: any[] = [
    { name: 'Only visible', key: 'AllColsFalse', value: false },
    { name: 'All columns', key: 'AllColsTrue', value: true }
  ];
  exportToExcelOptions_applyFilters: any[] = [
    { name: 'Apply current filters', key: 'CurrentFiltersTrue', value: true },
    { name: 'No filters', key: 'CurrentFiltersFalse', value: false }
  ];
  exportToExcelOptions_applySorting: any[] = [
    { name: 'Apply current sorts', key: 'CurrentSortingTrue', value: true },
    { name: 'No sorts', key: 'CurrentSortingFalse', value: false }
  ];
  exportToExcelOptions_selectedRows: any[] = [
    { name: 'All rows', key: 'SelectedRowsAll', value: 0 },
    { name: 'Only selected', key: 'SelectedRowsOnlySelected', value: 1 },
    { name: 'Only NOT selected', key: 'SelectedRowsOnlyNotSelected', value: 2 }
  ];
  exportToExcelOptions = {
    allColumns: false,
    applyFilters: true,
    applySorting: true,
    selectedRows: 0 // 0 - All, 1 - Only selected, 2 - Only NOT selected
  };

  reportTitle: string = ""; // The title of the Excel report
  reportTitleTime: string = ""; // The time of export of the report
  reportFinalTitle: string = "";

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;
  @ViewChild('paginatorContainer', { static: false }) paginatorContainer!: ElementRef;
  @ViewChild('headerContainer', { static: false }) headerContainer!: ElementRef;
  ngAfterViewInit() {
    if (this.computeScrollHeight) { // If we have to compute the scroll height
      window.addEventListener('resize', this.calculateScrollHeight.bind(this)); // Create an event listener for windows resize
      setTimeout(() => { this.calculateScrollHeight(); }, 1); // Delay to compute the scroll height after view init
    }
  }
  calculateScrollHeight() {
    setTimeout(() => {
      if (this.tableContainer && this.paginatorContainer && this.headerContainer) {
        const containerRect = this.tableContainer.nativeElement.getBoundingClientRect(); // Get the bounding rectangle of the table container
        const paginatorHeight = this.paginatorContainer.nativeElement.offsetHeight; // Get the height of the paginator container
        const headerHeight = this.headerContainer.nativeElement.offsetHeight; // Get the height of the header container
        const viewportHeight = window.innerHeight; // Get the height of the viewport (visible part of the window)
        const topOffset = containerRect.top + window.scrollY; // Calculate the top offset of the table container relative to the viewport
        this.scrollHeight = `${(viewportHeight - topOffset - paginatorHeight - headerHeight) - 45}px`; // Calculate and set the scrollable height by subtracting offsets and container heights
      }
    }, 1);
  }
  ngOnDestroy() {
    if (this.computeScrollHeight) { // If we had to compute the scroll height
      window.removeEventListener('resize', this.calculateScrollHeight.bind(this)); // Remove the event listener to windows resize
    }
  }

  getDataTypeAsText(dataType: enumDataType): string {
    switch (dataType) {
      case enumDataType.Text:
        return 'text';
      case enumDataType.Numeric:
        return 'numeric';
      case enumDataType.Boolean:
        return 'boolean';
      case enumDataType.Date:
        return 'date';
      default:
        return 'text';
    }
  }
  getDataAlignHorizontalAsText(dataAlignHorizontal: enumDataAlignHorizontal): string {
    switch (dataAlignHorizontal) {
      case enumDataAlignHorizontal.Left:
        return 'left';
      case enumDataAlignHorizontal.Center:
        return 'center';
      case enumDataAlignHorizontal.Right:
        return 'right';
      default:
        return 'center';
    }
  }
  getDataAlignVerticalAsText(dataAlignVertical: enumDataAlignVertical): string {
    switch (dataAlignVertical) {
      case enumDataAlignVertical.Top:
        return 'top';
      case enumDataAlignVertical.Middle:
        return 'middle';
      case enumDataAlignVertical.Bottom:
        return 'bottom';
      default:
        return 'middle';
    }
  }
  getFrozenColumnAlignAsText(frozenColumnAlign: enumFrozenColumnAlign): string {
    switch (frozenColumnAlign) {
      case enumFrozenColumnAlign.Left:
        return 'left';
      case enumFrozenColumnAlign.Right:
        return 'right';
      default:
        return 'left';
    }
  }

  dateFormat: string = "dd-MMM-yyyy HH:mm:ss zzzz";
  dateTimezone: string = "+00:00";
  dateCulture: string = "en-US";
  globalSearchText: string | null = null; // The text used by the global search

  currentPage: number = 0; // The current page we are at
  currentRowsPerPage: number = 0; // The current rows per page selected
  allowedRowsPerPage: number[] = []; // The different values of rows per page allowed
  totalRecords: number = 0; // The number of total records that are available (taking into account the filters)
  totalRecordsNotFiltered: number = 0; // The total number of records available if no filters were applied

  private columnsFetched: boolean = false; // Used to indicate if the columns data has at least been obtained once
  private columns: IprimengColumnsMetadata[] = []; // All the columns with all their data (not segmented into selectable and non-selectable)
  private columnsSelected: IprimengColumnsMetadata[] = []; // The columns (from the selectables) which are currently selected by the user
  private columnsNonSelectable: IprimengColumnsMetadata[] = []; // Columns which are always displayed
  columnsToShow: IprimengColumnsMetadata[] = []; // The combination of the non-selectable columns + selected columns that must be shown
  columnModalShow: boolean = false; // If the column modal window must be shown
  viewsModalShow: boolean = false; // If the views modal must be shown
  excelExportModalShow: boolean = false; // If the excel export modal must be shown

  predifinedFiltersSelectedValuesCollection: { [key: string]: any[] } = {}; // Contains a collection of the predifined column filters selection (possible values come from 'predifinedFiltersCollection')

  tableLazyLoadEventInformation: any = {}; // Data of the last lazy load event of the table
  data: any[] = []; // The array of data to be displayed

  columnModalData: any[] = []; // The array of data that is used to display the information about the columns
  filteredColumnData: any[] = []; // The array of data that shows the columns that are currently being shown in the columns modal (to count to show the filters)


  isRowSelected(rowID: any): boolean {
    return this.selectedRows.includes(rowID);
  }

  onRowSelectChange(event: any, rowID: any): void {
    if (event.checked) { // Add the selected item
      this.selectedRows.push(rowID);
    } else { // Remove the selected item
      this.selectedRows = this.selectedRows.filter(selectedId => selectedId !== rowID);
    }
    this.selectedRowsChange.emit({
      rowID: rowID,
      selected: event.checked
    });
  }

  /**
   * Updates the filters of a PrimeNG data table based on predefined filter changes.
   *
   * @param {string} filterName - The name of the filter to be updated.
   * @param {IPrimengPredifinedFilter[]} selectedValues - An array of selected predefined filter values.
   */
  onPredifinedFilterChange(filterName: string, selectedValues: IPrimengPredifinedFilter[]): void {
    const filters = { ...this.dt.filters }; // Create a shallow copy of the current filters to avoid mutating the original filters directly
    if (Array.isArray(filters[filterName])) { // Check if the filter for the given filterName is an array
      (filters[filterName] as FilterMetadata[]).forEach(criteria => { // If it is an array, iterate over each filter criteria
        criteria.value = selectedValues.map(value => value.value); // Update the value of each criteria with the values from selectedValues
      });
    } else if (filters[filterName]) { // Check if the filter for the given filterName exists and is not an array
      const criteria = filters[filterName] as FilterMetadata; // Cast the filter criteria to FilterMetadata
      criteria.value = selectedValues.map(value => value.value); // Update the value of the criteria with the values from selectedValues
    }
    this.dt.filters = filters; // Update the data table's filters with the modified filters object
    this.dt._filter(); // Trigger the filtering operation on the data table to apply the new filters
  }

  /**
   * Checks if the provided column metadata matches a specific style of the predefined filters 
   * that need to be applied to an item on a row.
   *
   * @param {IprimengColumnsMetadata} colMetadata - The metadata of the column being checked.
   * @param {any} value - The value to be matched against the predefined filter values.
   * @returns {any} The matching predefined filter value if found, otherwise null.
   */
  getPredfinedFilterMatch(colMetadata: IprimengColumnsMetadata, value: any): any {
    if (colMetadata.filterPredifinedValuesName && colMetadata.filterPredifinedValuesName.length > 0) { // Check if the column uses predefined filter values
      const options = this.getPredifinedFilterValues(colMetadata.filterPredifinedValuesName); // Get the predefined filter values based on the name
      return options.find(option => option.value === value); // Return the matching option if found
    }
    return null; // Return null if the column does not use predefined filter values
  }

  /**
   * Gets the list of values available for a predefined filter in a column.
   *
   * @param {string} columnKeyName - The name of the predefined filter option to retrieve values for.
   * @returns {IPrimengPredifinedFilter[]} An array of predefined filter values associated with the given option name. 
   * If the option name does not exist, an empty array is returned.
   */
  getPredifinedFilterValues(columnKeyName: string): IPrimengPredifinedFilter[] {
    return this.predifinedFiltersCollection[columnKeyName] || []; // Return the predefined filter values or an empty array if the option name does not exist
  }

  /**
   * Retrieves the number of values selected for a predefined filter.
   *
   * This function checks the collection of selected values for a specified column key name and returns a string
   * indicating the number of selected items along with a predefined text.
   *
   * @param {string} columnKeyName - The key name of the column for which to retrieve the number of selected values.
   * @returns {string} A string indicating the number of selected values for the specified column.
   */
  predifinedFiltersSelectedValuesText(columnKeyName: string): string {
    let numbItemsSelected = 0; // Initialize the count of selected items to zero
    if (this.predifinedFiltersSelectedValuesCollection[columnKeyName]) { // Check if there are selected values for the specified column key
      numbItemsSelected = this.predifinedFiltersSelectedValuesCollection[columnKeyName].length; // Get the number of selected items
    }
    return `${numbItemsSelected} ${this.predifinedFiltersCollectionSelectedValuesText}`; // Return the number of selected items concatenated with the predefined text
  }

  /**
   * Used to update the data of a table externally outside the component. Use this method instead of 'updateData' to force the data updata of a table
   *
   * @param {(optionalData?: any) => void} [continueAction] - Optional action to execute after data retrieval if it succeeded.
   * @param {boolean} [uponContinueActionEndModalHttp=false] - Optional flag to set the loading indicator to inactive after data retrieval.
   */
  updateDataExternal(continueAction?: (optionalData?: any) => void, uponContinueActionEndModalHttp: boolean = false): void {
    this.canPerformActions = true; // Indicate that the table has been enabled to perform actions
    this.updateData(this.tableLazyLoadEventInformation, continueAction, uponContinueActionEndModalHttp); // Force the data of the table to be updated
  }

  /**
   * @warning This function is intended for internal use within the component. Do not call it directly from outside the component.
   * To trigger a data update from outside the component use 'updateDataExternal' instead.
   * 
   * Updates the data of a table if `canPerformActions` is true and the columns have already been fetched.
   * If the columns have not been fetched yet, it will attempt to get them.
   * A `continueAction` can be specified to execute something upon data retrieval if it succeeded and `canPerformActions` is true.
   * `uponContinueActionEndModalHttp` can be used to set the loading indicator to active or inactive after the query ended successfully.
   *
   * @param {any} event - The event object containing pagination, sorting, and filtering information.
   * @param {(optionalData?: any) => void} [continueAction] - Optional action to execute after data retrieval if it succeeded.
   * @param {boolean} [uponContinueActionEndModalHttp=false] - Optional flag to set the loading indicator to inactive after data retrieval and if there is a 'continueAction' defined.
   * 
   * @example
   * // Example usage of updateData function
   * const event: any = { eventdata };
   * const continueAction = (optionalData?: any) => {
   *   console.log('Continue action executed.');
   * };
   * const uponContinueActionEndModalHttp = true;
   * 
   * updateData(event, continueAction, uponContinueActionEndModalHttp);
   */
  updateData(event: any, continueAction?: (optionalData?: any) => void, uponContinueActionEndModalHttp: boolean = false, tableView?: IPrimeNgViewData): void {
    if (!this.canPerformActions) { // Check if actions can be performed
      return; // Exit if actions cannot be performed
    }
    this.tableLazyLoadEventInformation = event; // Store the event information for later use
    if (!this.columnsFetched) { // Check if columns have been fetched
      this.getColumns(continueAction, uponContinueActionEndModalHttp); // Fetch columns if not already fetched
      return; // Exit after fetching columns (when columns load the lazy load event of the table will be triggered again)
    }
    let filtersWithoutGlobalAndSelectedRows = this.modifyFiltersWithoutGlobalAndSelectedRows(this.tableLazyLoadEventInformation.filters); // Create filters excluding the global filter
    filtersWithoutGlobalAndSelectedRows = this.revertDateTimeZoneFilters(filtersWithoutGlobalAndSelectedRows);
    // const requestData: IprimengTableDataPost = {
    //   page: this.currentPage, // Set the current page number
    //   pageSize: this.currentRowsPerPage, // Set the number of rows per page
    //   sort: this.tableLazyLoadEventInformation.multiSortMeta, // Set the sorting information
    //   filter: filtersWithoutGlobalAndSelectedRows, // Set the filters excluding the global filter
    //   globalFilter: this.globalSearchText, // Set the global filter text
    //   columns: (tableView && tableView.columnsShown && tableView.columnsShown.length > 0)
    //     ? tableView.columnsShown.map(col => col.field)
    //     : this.columnsToShow.map(col => col.field), // Set the columns to show

    //   dateFormat: this.dateFormat,
    //   dateTimezone: this.dateTimezone,
    //   dateCulture: this.dateCulture
    // };

    this.data = this.dataSource.data; // Update the table data
    this.totalRecords = this.dataSource.totalRecords; // Update the total number of records
    this.totalRecordsNotFiltered = this.dataSource.totalRecordsNotFiltered; // Update the total records not filtered
    this.currentPage = this.dataSource.page; // Update the current page
    if (tableView && tableView.columnsShown && tableView.columnsShown.length > 0) {
      this.columnsSelected = tableView.columnsShown
        .map(data => this.columns.find((col: any) => col.field === data.field))
        .filter((col): col is IprimengColumnsMetadata => col !== undefined)
        .filter(col => !this.columnsNonSelectable.includes(col));
      this.columnsToShow = this.orderColumnsWithFrozens(this.columnsNonSelectable.concat(this.columnsSelected));
      this.updateColumnsSpecialProperties(tableView.columnsShown);
      this.dt.restoreColumnWidths();
    }
    if (!this.tableViewsInit) {
      this.tableViewsInit = true;
      this.tableViewsGet();
    }
    if (continueAction) { // Check if a continue action is specified
      continueAction(); // Execute the continue action
    }


    // this.sharedService.handleHttpResponse(
    //   this.primengTableService.fetchTableData(this.dataSoureURL, requestData) // Fetch table data from the server
    // ).subscribe({
    //   next: (responseData: IprimengTableDataReturn) => { // Handle the successful data retrieval
    //     this.data = responseData.data; // Update the table data
    //     this.totalRecords = responseData.totalRecords; // Update the total number of records
    //     this.totalRecordsNotFiltered = responseData.totalRecordsNotFiltered; // Update the total records not filtered
    //     this.currentPage = responseData.page; // Update the current page
    //     if (tableView && tableView.columnsShown && tableView.columnsShown.length > 0) {
    //       this.columnsSelected = tableView.columnsShown
    //         .map(data => this.columns.find((col: any) => col.field === data.field))
    //         .filter((col): col is IprimengColumnsMetadata => col !== undefined)
    //         .filter(col => !this.columnsNonSelectable.includes(col));
    //       this.columnsToShow = this.orderColumnsWithFrozens(this.columnsNonSelectable.concat(this.columnsSelected));
    //       this.updateColumnsSpecialProperties(tableView.columnsShown);
    //       this.dt.restoreColumnWidths();
    //     }
    //     if (!this.tableViewsInit) {
    //       this.tableViewsInit = true;
    //       this.tableViewsGet();
    //     }
    //     if (continueAction) { // Check if a continue action is specified
    //       continueAction(); // Execute the continue action
    //     }
    //   },
    //   error: (err: any) => { // Handle errors during data retrieval
    //     this.sharedService.dataFecthError("ERROR FETCHING DATA", err); // Display an error message
    //   }
    // });



  }

  /**
   * Fetches table columns and allowed paginations, then updates the view with the fetched data.
   * Optionally continues with a specified action after the data is fetched.
   *
   * @param {Function} [continueAction] - (Optional) A function to be executed after fetching the columns and allowed paginations. The function can take optional data as a parameter.
   * @param {boolean} [uponContinueActionEndModalHttp=false] - (Optional) A boolean indicating whether to end the modal HTTP waiting view upon the completion of the continue action. Defaults to false.
   */
  getColumns(continueAction?: (optionalData?: any) => void, uponContinueActionEndModalHttp: boolean = false, clearTableView: boolean = false) {
    this.columnsFetched = false;
    this.canPerformActions = false;

    this.allowedRowsPerPage = this.columnsSource.allowedItemsPerPage;
    this.currentRowsPerPage = Math.min(...this.allowedRowsPerPage);
    this.columns = this.columnsSource.columnsInfo;
    this.columnsNonSelectable = this.columns.filter((col: any) => !col.canBeHidden); // Filter columns that cannot be hidden
    this.columnsSelected = this.columns.filter((col: any) => !col.startHidden && col.canBeHidden); // Selected columns that
    this.columnsToShow = this.orderColumnsWithFrozens(this.columnsNonSelectable.concat(this.columnsSelected));
    this.dateFormat = this.columnsSource.dateFormat;
    this.dateTimezone = this.columnsSource.dateTimezone;
    this.dateCulture = this.columnsSource.dateCulture;
    this.currentPage = 0;


    if (this.getInitialWidths) {
      setTimeout(() => {
        this.initialColumnWidths = this.primengTableViewsService.computeColumnWidths(this.dt);
        this.initialTableWidth = this.primengTableViewsService.computeTableWidth(this.dt);
        this.getInitialWidths = false;
      }, 1);
    }

    if (clearTableView) {
      this.clearFilters(this.dt, true);
      this.clearSorts(this.dt, true);
      this.dt.tableWidthState = this.initialTableWidth;
      this.dt.columnWidthsState = this.initialColumnWidths;
      this.dt.restoreColumnWidths()
      this.tableLazyLoadEventInformation.multiSortMeta = [];
    }
    setTimeout(() => {
      this.columnsFetched = true; // Indicate that we have fetched the columns
      this.canPerformActions = true;
      this.updateData(this.tableLazyLoadEventInformation, continueAction, uponContinueActionEndModalHttp); // Update data with the fetched columns and execute continue action if provided
    }, 450); // We need this delay so it doesn't launch another call


    // this.sharedService.handleHttpResponse(this.primengTableService.fetchTableColumnsAndAllowedPaginations(this.columnsSourceURL)).subscribe({
    //   next: (responseData: IprimengColumnsAndAllowedPagination) => { // Handle successful response
    //     // this.allowedRowsPerPage = responseData.allowedItemsPerPage; // Update the number of rows allowed per page
    //     // this.currentRowsPerPage = Math.min(...this.allowedRowsPerPage); // Update the current rows per page to use the minimum value of allowed rows per page by default
    //     // this.columns = responseData.columnsInfo; // Update columns with fetched data
    //     // this.columnsNonSelectable = this.columns.filter((col: any) => !col.canBeHidden); // Filter columns that cannot be hidden
    //     // this.columnsSelected = this.columns.filter((col: any) => !col.startHidden && col.canBeHidden); // Selected columns that are not hidden by default
    //     // this.columnsToShow = this.orderColumnsWithFrozens(this.columnsNonSelectable.concat(this.columnsSelected));
    //     // this.dateFormat = responseData.dateFormat;
    //     // this.dateTimezone = responseData.dateTimezone;
    //     // this.dateCulture = responseData.dateCulture;
    //     // this.currentPage = 0;
    //     // if (this.getInitialWidths) {
    //     //   setTimeout(() => {
    //     //     this.initialColumnWidths = this.primengTableViewsService.computeColumnWidths(this.dt);
    //     //     this.initialTableWidth = this.primengTableViewsService.computeTableWidth(this.dt);
    //     //     this.getInitialWidths = false;
    //     //   }, 1);
    //     // }
    //     // if (clearTableView) {
    //     //   this.clearFilters(this.dt, true);
    //     //   this.clearSorts(this.dt, true);
    //     //   this.dt.tableWidthState = this.initialTableWidth;
    //     //   this.dt.columnWidthsState = this.initialColumnWidths;
    //     //   this.dt.restoreColumnWidths()
    //     //   this.tableLazyLoadEventInformation.multiSortMeta = [];
    //     // }
    //     // setTimeout(() => {
    //     //   this.columnsFetched = true; // Indicate that we have fetched the columns
    //     //   this.canPerformActions = true;
    //     //   this.updateData(this.tableLazyLoadEventInformation, continueAction, uponContinueActionEndModalHttp); // Update data with the fetched columns and execute continue action if provided
    //     // }, 450); // We need this delay so it doesn't launch another call
    //   },
    //   error: (err: any) => { // Handle error response
    //     this.sharedService.dataFecthError("ERROR IN GET COLUMNS AND ALLOWED PAGINATIONS", err); // Log the error
    //   }
    // });
  }

  createOrUpdateTableView() {
    const aliasToSave: string = this.newViewAlias.trim();
    if (aliasToSave.length < 3 || aliasToSave.length > 30) {
      this.sharedService.showToast("error", "INCORRECT TABLE VIEW ALIAS LENGTH", "The table view alias must be between 3 and 50 characters.");
      return;
    }
    if (this.primengTableViewsService.get(this.tableViewsList, aliasToSave) !== undefined) {
      this.sharedService.showToast("error", "ALIAS ALREADY EXISTS", "A view with this alias already exists.");
      return;
    }
    if (this.editingViewAlias !== "") {
      let itemFetched = this.primengTableViewsService.get(this.tableViewsList, this.editingViewAlias);
      if (itemFetched === undefined) {
        this.sharedService.showToast("error", "ERROR UPDATING VIEW NAME", `The table view '${this.editingViewAlias}' no longer exists.`);
        return;
      }
      if (this.tableViewCurrentSelectedAlias === itemFetched.viewAlias) {
        this.tableViewCurrentSelectedAlias = aliasToSave;
      }
      itemFetched.viewAlias = aliasToSave;
    } else {
      const newView: IPrimeNgView = {
        viewAlias: aliasToSave,
        viewData: this.primengTableViewsService.generateSaveData(this.dt, this.globalSearchText, this.currentPage, this.currentRowsPerPage, this.modifyFiltersWithoutGlobalAndSelectedRows.bind(this))
      };
      this.tableViewsList.push(newView);
      this.tableViewCurrentSelectedAlias = aliasToSave;
    }
    this.saveTableViews(true, false, aliasToSave);
  }

  saveTableViews(closeCreateNewModal: boolean = false, skipCreate: boolean = false, viewAliasToUpdate?: string) {
    if (!skipCreate && viewAliasToUpdate && this.editingViewAlias === "") {
      let itemToUpdate = this.primengTableViewsService.get(this.tableViewsList, viewAliasToUpdate);
      if (itemToUpdate === undefined) {
        this.sharedService.showToast("error", "ERROR SAVING VIEWS", `The table view '${viewAliasToUpdate}' no longer exists.`);
        this.tableViewCurrentSelectedAlias = null;
        return;
      }
      itemToUpdate.viewData = this.primengTableViewsService.generateSaveData(this.dt, this.globalSearchText, this.currentPage, this.currentRowsPerPage, this.modifyFiltersWithoutGlobalAndSelectedRows.bind(this));
    }
    let tableView: string = JSON.stringify(this.tableViewsList);
    switch (this.tableViewSaveAs) {
      case enumTableViewSaveMode.sessionStorage:
        sessionStorage.setItem(this.tableViewSaveKey, tableView);
        break;
      case enumTableViewSaveMode.localStorage:
        localStorage.setItem(this.tableViewSaveKey, tableView);
        break;
      case enumTableViewSaveMode.databaseStorage:
        const saveObsv = this.primengTableViewsService.databaseSaveList(this.tableViewsList, this.viewsSaveSourceURL, this.tableViewSaveKey);
        this.sharedService.handleHttpResponse(saveObsv, 200, false).subscribe({
          next: () => {
            this.finishSaveView(skipCreate, closeCreateNewModal);
          },
          error: (err: any) => { // Handle error response
            this.sharedService.dataFecthError("ERROR SAVING TABLE VIEW", err); // Log the error
          }
        })
        return;
      default:
        this.sharedService.showToast("error", "NOT IMPLEMENTED", "This type os save view has not been implemented yet.");
        return;
    }
    this.finishSaveView(skipCreate, closeCreateNewModal);
  }
  finishSaveView(skipCreate: boolean, closeCreateNewModal: boolean) {
    if (!skipCreate) {
      if (this.editingViewAlias === "") {
        this.sharedService.showToast("info", "Table view saved", `The table view '${this.tableViewCurrentSelectedAlias}' has been saved.`);
      } else {
        this.sharedService.showToast("info", "Table view name updated", `The table view '${this.editingViewAlias}' had its alias updated.`);
        this.editingViewAlias = "";
      }
    }
    this.primengTableViewsService.sort(this.tableViewsList);
    if (closeCreateNewModal) {
      this.tableViews_menuItems = [...this.primengTableViewsService.updateMenuItems(this.tableViewsList)];
      this.newViewShowModal = false;
    }
  }
  deleteTableView(aliasToDelete: string) {
    let itemToFind = this.primengTableViewsService.get(this.tableViewsList, aliasToDelete);
    if (itemToFind === undefined) {
      this.sharedService.showToast("error", "ERROR DELETING VIEW", `Table view '${aliasToDelete}' no longer exists.`);
      return;
    }
    this.tableViewsList = this.tableViewsList.filter(item => item.viewAlias !== aliasToDelete);
    this.tableViews_menuItems = [...this.primengTableViewsService.updateMenuItems(this.tableViewsList)];
    if (this.tableViewCurrentSelectedAlias === aliasToDelete) {
      this.tableViewCurrentSelectedAlias = null;
    }
    this.editingViewAlias = "";
    this.saveTableViews(false, true);
    this.sharedService.showToast("info", "DELETED TABLE VIEW", `Table view '${aliasToDelete}' has been deleted.`);
  }

  tableViewsGet(): void {
    const tableView = this.primengTableViewsService.recoverList(this.tableViewSaveAs, this.viewsGetSourceURL, this.tableViewSaveKey);
    if (tableView instanceof Observable) {
      this.sharedService.handleHttpResponse(tableView).subscribe({
        next: (responseData: any) => {
          let resultadoParseado = responseData.map((item: any) => ({
            viewAlias: item.viewAlias,
            viewData: JSON.parse(item.viewData)
          }));
          this.tableViewListProcess(resultadoParseado);
        },
        error: (err: any) => { // Handle error response
          this.sharedService.dataFecthError("ERROR GETTING TABLE VIEW", err); // Log the error
        }
      })
    } else {
      this.tableViewListProcess(tableView);
    }
  }
  tableViewListProcess(tableView: IPrimeNgView[]) {
    this.tableViewsList = [...tableView];
    if (this.tableViewsList.length > 0) {
      this.primengTableViewsService.sort(this.tableViewsList);
    }
    this.tableViews_menuItems = [...this.primengTableViewsService.updateMenuItems(this.tableViewsList)];
    this.tableViewsFirstFetchDone = true;
  }

  hasLoadView(): boolean {
    if (this.tableViewSaveKey === "" || this.tableViewSaveAs === enumTableViewSaveMode.noone || this.tableViewsList.length == 0 || !this.tableViewCurrentSelectedAlias) {
      return false;
    }
    return true;
  }

  loadTableView(aliasToSet?: string) {
    if (!aliasToSet) {
      if (this.tableViewCurrentSelectedAlias == null) {
        this.sharedService.showToast("error", "ERROR LOADING VIEW", `There is no selected table view '${aliasToSet}'.`);
        return;
      }
      aliasToSet = this.tableViewCurrentSelectedAlias!;
    }
    let itemToFind = this.primengTableViewsService.get(this.tableViewsList, aliasToSet);
    if (itemToFind === undefined) {
      this.sharedService.showToast("error", "ERROR LOADING VIEW", `Table view '${aliasToSet}' no longer exists.`);
      this.tableViewCurrentSelectedAlias = null;
      return;
    }
    this.tableViewCurrentSelectedAlias = aliasToSet;
    const tableView: IPrimeNgViewData = itemToFind.viewData;
    this.currentPage = tableView.currentPage;
    this.currentRowsPerPage = tableView.currentRowsPerPage;
    this.globalSearchText = tableView.globalSearchText;
    this.tableLazyLoadEventInformation.multiSortMeta = [...(tableView.multiSortMeta ?? [])];
    this.dt.multiSortMeta = [...(tableView.multiSortMeta ?? [])];
    this.canPerformActions = false;
    this.dt.sortMultiple();
    this.canPerformActions = true;

    this.tableLazyLoadEventInformation.filters = { ...tableView.filters };
    this.dt.filters = { ...tableView.filters };

    this.dt.tableWidthState = tableView.tableWidth;
    this.dt.columnWidthsState = tableView.columnsWidth;

    this.updateData(this.tableLazyLoadEventInformation, undefined, undefined, tableView);
    this.sharedService.showToast("info", "Table view restored", `The table view '${this.tableViewCurrentSelectedAlias}' has been restored.`);
    this.viewsModalShow = false;
  }

  resetTableView() {
    this.tableViewCurrentSelectedAlias = null;
    this.getColumns(undefined, undefined, true);
    this.sharedService.showToast("info", "Table view reseted", "The view of the table has been reset to its original state.");
  }

  /**
   *  Orders the list of columns that must be shown taking into account that columns frozen to the left should be ordered first
   *  and the ones to the right last, to avoid visual gltichs with the PrimeNG table component
   */
  private orderColumnsWithFrozens(colsToOrder: IprimengColumnsMetadata[]): IprimengColumnsMetadata[] {
    const frozenLeftColumns = colsToOrder.filter(col => col.frozenColumnAlign === enumFrozenColumnAlign.Left);
    const frozenRightColumns = colsToOrder.filter(col => col.frozenColumnAlign === enumFrozenColumnAlign.Right);
    const nonFrozenColumns = colsToOrder.filter(col => col.frozenColumnAlign === enumFrozenColumnAlign.Noone);
    return [...frozenLeftColumns, ...nonFrozenColumns, ...frozenRightColumns];
  }

  clearFilters(dt: Table, force: boolean = false, onlyGlobalFilter: boolean = false): void {
    let hasToClear = this.hasToClearFilters(dt, this.globalSearchText, force);
    if (hasToClear) {
      if (!onlyGlobalFilter) {
        this.predifinedFiltersSelectedValuesCollection = {};
        for (const key in dt.filters) {
          if (dt.filters.hasOwnProperty(key)) {
            const filters = dt.filters[key];
            if (Array.isArray(filters)) {
              filters.forEach(filter => {
                filter.value = null;  // Establecer el valor a null
              });
            } else {
              filters.value = null; // Establecer el valor a null
            }
          }
        }
        let filters = { ...this.dt.filters };
        dt.columns?.forEach(
          element => {
            dt.filter(null, element.field, element.matchMode)
          }
        );
        this.dt.filters = filters;
      }
      this.globalSearchText = null;
      dt.filterGlobal('', '');
    }
  }

  hasToClearFilters(dt: Table, globalSearchText: string | null, force: boolean = false): boolean {
    let hasToClear: boolean = false;
    const filtersWithoutGlobalAndSelectedRows = this.modifyFiltersWithoutGlobalAndSelectedRows(dt.filters)
    const hasFilters = this.hasFilters(filtersWithoutGlobalAndSelectedRows);
    const hasGlobalFilter = (globalSearchText && globalSearchText.trim() !== "");
    if (force || hasFilters || hasGlobalFilter) {
      hasToClear = true;
    }
    return hasToClear;
  }

  clearSorts(dt: Table, force: boolean = false): void {
    let hasToClear = this.hasToClearSorts(dt, force);
    if (hasToClear) {
      dt.multiSortMeta = [];
      dt.sortMultiple();
    }
  }

  hasToClearSorts(dt: Table, force: boolean = false): boolean {
    let hasToClear: boolean = false;
    const hasSorts = (dt.multiSortMeta && dt.multiSortMeta.length > 0);
    if (force || hasSorts) {
      hasToClear = true;
    }
    return hasToClear;
  }

  private modifyFiltersWithoutGlobalAndSelectedRows(filters: any, overrideOption: number = -1): any {
    if (this.globalSearchText === "") { // If the global search text is an empty string
      this.globalSearchText = null; // Set it to null
    }
    let filtersWithoutGlobalAndSelectedRows = { ...filters }; // Create a copy of filters to delete the global.
    if (filtersWithoutGlobalAndSelectedRows.hasOwnProperty('global')) { // If there is an entry with the global filter
      delete filtersWithoutGlobalAndSelectedRows['global']; // Remove the global filter
    }
    this.selectorRowFilterBuilder(filtersWithoutGlobalAndSelectedRows, overrideOption);
    return filtersWithoutGlobalAndSelectedRows; // Return the filters without global array
  }

  private selectorRowFilterBuilder(filtersWithoutGlobalAndSelectedRows: any, overrideOption: number = -1) {
    if (filtersWithoutGlobalAndSelectedRows.hasOwnProperty('selector')) {
      const selectorFilter = filtersWithoutGlobalAndSelectedRows['selector'][0];
      let filterType: boolean | null = null;
      if (overrideOption < 0 || overrideOption > 2) {
        filterType = selectorFilter.value;
      } else {
        switch (overrideOption) {
          case 0: // All
            filterType = null;
            break;
          case 1: // Only selected rows
            filterType = true;
            break;
          case 2: // Only NOT selected
            filterType = false;
            break;
        }
      }
      if (!filtersWithoutGlobalAndSelectedRows.hasOwnProperty('rowID')) {
        filtersWithoutGlobalAndSelectedRows['rowID'] = [
          {
            "value": null,
            "matchMode": "in",
            "operator": "or"
          }
        ];
      }
      const idFilter = filtersWithoutGlobalAndSelectedRows['rowID'][0];
      if (filterType === true) {
        idFilter.matchMode = "in";
        idFilter.value = this.selectedRows;
      } else if (filterType === false) {
        idFilter.operator = "and"
        idFilter.matchMode = "notIn";
        idFilter.value = this.selectedRows;
      } else if (filterType === null) {
        idFilter.value = null;
        idFilter.matchMode = "in";
      }
    }
  }

  revertDateTimeZoneFilters(inputFilter: any) {
    this.columnsToShow.forEach((column) => {
      if (column.dataType === enumDataType.Date) { // If its date type
        if (inputFilter.hasOwnProperty(column.field)) {
          const originalDate = inputFilter[column.field][0].value;
          if (originalDate !== null && originalDate instanceof Date) {
            const utcDate = new Date(Date.UTC(originalDate.getFullYear(), originalDate.getMonth(), originalDate.getDate()))
            inputFilter[column.field][0].value = utcDate;
          }
        }
      }
    });
    return inputFilter;
  }

  /**
   * Determines whether there are active filters based on the provided filter rules.
   *
   * @param {any} filterRules An object representing filter rules for each column.
   *   The keys are column names, and the values are arrays of filter rules.
   *   Each filter rule has the following properties:
   *     - `field`: The field or property name of the column.
   *     - `value`: The filter value entered by the user.
   *     - Other properties depending on the type of filter (e.g., `matchMode` for string filters).
   * @returns {boolean} `true` if at least one active filter is found, otherwise `false`.
   */
  private hasFilters(filterRules: any): boolean {
    for (const columnName of Object.keys(filterRules)) { // Iterate over each column name in the filter rules
      const columnFilters = filterRules[columnName]; // Get the filter rules for the current column
      for (const filterRule of columnFilters) { // Iterate over each filter rule for the current column
        if (filterRule.value !== null && filterRule.value !== "") { // Check if the filter value is not null or an empty string
          return true; // At least one active filter found
        }
      }
    }
    return false; // No active filters found
  }

  /**
   * Handles click events on action buttons in a row of data.
   * 
   * @param {function} action - The action function to be executed when the button is clicked. It should accept one parameter, which is the row data.
   * @param {any} [rowData=null] - The data of the row corresponding to the clicked button. Defaults to null.
   * 
   * @returns {void}
   * 
   * @example
   * // Define an action for a button
   * const deleteAction = (rowData) => {
   *   console.log(`Delete row with id: ${rowData.rowID}`);
   * };
   * 
   * // Use handleButtonsClick with row data
   * handleButtonsClick(deleteAction, { rowID: 1, name: 'John Doe' });
   */
  handleButtonsClick(action: (rowData: any) => void, rowData: any = null): void {
    if (action) { // If the button has an assigned action
      action(rowData); // Perform the action
    }
  }

  /**
   * Handles the change of page and/or rows per page in the table.
   * 
   * @param {any} event - The event object containing page and rows information.
   */
  pageChange(event: any): void {
    this.currentPage = event.page!; // Update the current page
    this.currentRowsPerPage = event.rows!; // Update the number of rows per page
    this.updateData(this.tableLazyLoadEventInformation); // Force the data to be updated
  }

  showColumnModal() {
    let tempData = this.columns.map(column => {
      const isSelected = this.columnsSelected.some(selectedColumn => selectedColumn.field === column.field) || this.columnsNonSelectable.some(selectedColumn => selectedColumn.field === column.field);
      const isSelectDisabled = this.columnsNonSelectable.some(selectedColumn => selectedColumn.field === column.field);
      return {
        field: column.field,
        header: column.header,
        selected: isSelected,
        selectDisabled: isSelectDisabled,
        cellOverflowBehaviour: column.cellOverflowBehaviour,
        cellOverflowBehaviourDisabled: !column.cellOverflowBehaviourAllowUserEdit,
        dataAlignHorizontal: column.dataAlignHorizontal,
        dataAlignHorizontalDisabled: !column.dataAlignHorizontalAllowUserEdit,
        dataAlignVertical: column.dataAlignVertical,
        dataAlignVerticalDisabled: !column.dataAlignVerticalAllowUserEdit
      };
    });
    tempData.slice().sort((a: any, b: any) => { // Sort selectable columns by header
      const fieldA = a.header.toUpperCase();
      const fieldB = b.header.toUpperCase();
      return fieldA.localeCompare(fieldB);
    });
    this.columnModalData = [...tempData];
    this.filteredColumnData = this.columnModalData;
    this.columnModalShow = true;
  }

  applyColumnModalChanges() {
    const existingColumns = this.dt.columns!;
    const columnsToKeep = new Set<string>();
    this.columnsNonSelectable.forEach(column => {
      columnsToKeep.add(column.field);
    });
    this.columnModalData.forEach(column => {
      if (column.selected && !column.selectDisabled) {
        columnsToKeep.add(column.field);
      }
    });
    const finalColumns: IprimengColumnsMetadata[] = []; // Used to store the final result of columns (ordered)
    existingColumns.forEach(column => {
      if (columnsToKeep.has(column.field)) {
        finalColumns.push(column);
      }
    }); // Filter the existing columns to only keep those ones that are in columnsToKeep
    this.columnModalData.forEach(column => {
      if (column.selected && !column.selectDisabled) {
        const matchingColumn = this.columns.find(c => c.field === column.field);
        if (matchingColumn && !finalColumns.find(c => c.field === matchingColumn.field)) {
          finalColumns.push(matchingColumn);
        }
      }
    });
    let prevColsToShow = this.columnsToShow;
    this.columnsToShow = this.orderColumnsWithFrozens(finalColumns); // Order the columns that must be shown
    let sameColumnsAsBefore =
      prevColsToShow.length === this.columnsToShow.length && // Check if lengths are the same
      prevColsToShow.every((prevCol, index) => prevCol.field === this.columnsToShow[index].field); // Check each 'field' for equality
    this.columnsSelected = this.columnsToShow.filter(column =>
      !this.columnsNonSelectable.some(nonSelectable => nonSelectable.field === column.field)
    ); // Update selected columns

    this.updateColumnsSpecialProperties(this.columnModalData);

    if (!sameColumnsAsBefore) { // If we don't have the same columns as before, we need to update.
      this.canPerformActions = false;
      this.clearSorts(this.dt, true);
      setTimeout(() => {
        this.canPerformActions = true;
        this.clearSorts(this.dt, true);
      }, 1);
    }

    this.columnModalShow = false;
  }

  private updateColumnsSpecialProperties(columnsSource: any[]) {
    const allColumns = [this.columns, this.columnsToShow, this.columnsSelected, this.columnsNonSelectable];
    const columnModalDataMap = new Map(columnsSource.map((item: any) => [item.field, {
      cellOverflowBehaviour: item.cellOverflowBehaviour,
      dataAlignHorizontal: item.dataAlignHorizontal,
      dataAlignVertical: item.dataAlignVertical,
      width: item.width
    }]));
    const updatedFields = new Set(); // To track updated fields
    allColumns.forEach((columnList) => {
      columnList.forEach((col: any) => {
        if (columnModalDataMap.has(col.field) && !updatedFields.has(col.field)) {
          const columnData = columnModalDataMap.get(col.field);
          if (columnData) {
            col.cellOverflowBehaviour = columnData.cellOverflowBehaviour;
            col.dataAlignHorizontal = columnData.dataAlignHorizontal;
            col.dataAlignVertical = columnData.dataAlignVertical;
            col.width = columnData.width;
            updatedFields.add(col.field);
          }
        }
      });
    });
  }

  allColumnsCheckboxActive(): boolean {
    return this.columnModalData.every(column => column.selected);
  }

  allColumnsCheckboxClick(event: any): void {
    if (event.checked) {
      this.columnModalData.forEach(column => { column.selected = true; });
    } else {
      this.columnModalData.forEach(column => {
        if (!column.selectDisabled) {
          column.selected = false;
        }
      });
    }
  }

  filterColumnModal(event: any) {
    let filterValue = event.target.value;
    this.dt_columnDialog.filterGlobal(filterValue, 'contains');
  }

  onColumnModalFilter(event: any) {
    const filterValue = event.filters && event.filters.global
      ? event.filters.global.value.toLowerCase()
      : '';
    this.filteredColumnData = this.columnModalData.filter(column =>
      column.header.toLowerCase().includes(filterValue)
    );
  }

  highlightText(cellValue: any, colMetadata: IprimengColumnsMetadata, globalSearchText: string | null): SafeHtml {
    return this.primengTableService.highlightText(cellValue, colMetadata, globalSearchText);
  }

  /**
   * Formats a date value to a specific string format. Provided date will be assumed to be in UTC
   *
   * @param {any} value - The date value to be formatted.
   * @returns {string} - The formatted date string in 'dd-MMM-yyyy HH:mm:ss' format followed by the timezone, or empty string if the provided value is invalid or undefined.
   * 
   * @example
   * // Example date value
   * const dateValue: Date = new Date();
   * 
   * // Use formatDate to get the formatted date string
   * const formattedDate: string = formatDate(dateValue);
   * 
   * // Output might be: '18-Jun-2024 14:30:00 GMT+0000'
   */
  formatDate(value: any): string {
    let formattedDate = undefined; // By default, formattedDate will be undefined
    if (value) { // If value is not undefined
      formattedDate = this.datePipe.transform(value, this.dateFormat, this.dateTimezone, this.dateCulture); // Perform the date masking
    }
    return formattedDate ?? ''; // Returns the date formatted, or as empty string if an issue was found (or value was undefined).
  }

  updateIconBlobsForCollections(): void {
    Object.keys(this.predifinedFiltersCollection).forEach(key => {
      const filters = this.predifinedFiltersCollection[key];
      if (Array.isArray(filters) && filters.length > 0) {
        filters.forEach(filter => {
          if (filter.iconBlobSourceEndpoint && !filter.iconBlob) {
            filter.iconBlob = undefined;
            filter.iconBlobSourceEndpointResponseError = false;
            this.sharedService.handleHttpResponse(this.primengTableService.getIconBlob(filter.iconBlobSourceEndpoint)).subscribe({
              next: (blobData: Blob) => {
                filter.iconBlob = blobData;
              },
              error: () => { // Handle error response
                filter.iconBlobSourceEndpointResponseError = true;
              }
            });
          }
        });
      } else {
        console.warn(`Filters for key ${key} is not an array:`, filters);
      }
    });
  }

  /**
   * Converts a blob from the database to a safe URL that can be used to display an image.
   *
   * This function takes a `Blob` object, converts it to a base64 encoded string, and returns a `SafeUrl` 
   * that can be used in an HTML template to display the image securely. The `SafeUrl` ensures that 
   * Angular's security mechanisms are bypassed correctly, preventing potential security risks.
   *
   * @param {Blob} blob - The blob object representing the image data from the database.
   * @returns {SafeUrl} A safe URL that can be used to display the image in an HTML template.
   * 
   * @example
   * // Example usage in a component
   * const imageBlob = new Blob([binaryData], { type: 'image/jpeg' });
   * const imageUrl = this.getBlobIconAsUrl(imageBlob);
   * 
   * // In your HTML template
   * <img [src]="imageUrl" alt="Image">
   */
  getBlobIconAsUrl(blob: Blob): SafeUrl {
    let objectURL = `data:image/jpeg;base64,${blob}`; // Create a base64 encoded string from the blob data
    return this.sanitizer.bypassSecurityTrustUrl(objectURL); // Bypass Angular's security mechanisms to create a SafeUrl
  }

  newViewModalShow(asNew: boolean = true, aliasToLoad: string = "") {
    if (this.tableViewsList.length >= this.maxTableViews && asNew) {
      this.sharedService.showToast("error", "MAX TABLE VIEWS REACHED", `You can't have more than ${this.maxTableViews} views. Please, delete some views before creating new ones.`)
      return;
    }
    this.newViewAlias = aliasToLoad;
    this.newViewShowModal = true;
    if (!asNew) {
      this.editingViewAlias = aliasToLoad;
    } else {
      this.editingViewAlias = "";
    }
  }

  copyToClipboardStart(event: MouseEvent) {
    if (this.copyCellDataToClipboardTimeSecs > 0) {
      const cellContent = (event.target as HTMLElement).innerText;
      this.copyCellDataTimer = setTimeout(() => {
        navigator.clipboard.writeText(cellContent).then(() => {
          this.sharedService.clearToasts();
          this.sharedService.showToast("info", "CELL CONTENT COPIED", "The cell content has been copied to your clipboard.");
        }).catch(err => {
          this.sharedService.clearToasts();
          this.sharedService.showToast("error", "CELL CONTENT COPIED", `The cell content failed to copy to your clipboard with error: ${err}`);
        });
      }, this.copyCellDataToClipboardTimeSecs * 1000);
    }
  }

  copyToClipboardCancel() {
    if (this.copyCellDataToClipboardTimeSecs > 0) {
      clearTimeout(this.copyCellDataTimer);
    }
  }

  getColumnStyle(col: any, headerCols: boolean = false): Record<string, string> {
    let styles: Record<string, string> = {};
    if (!headerCols) {
      styles = {
        'white-space': col.cellOverflowBehaviour === enumCellOverflowBehaviour.Wrap ? 'normal' : 'nowrap',
        'word-wrap': col.cellOverflowBehaviour === enumCellOverflowBehaviour.Wrap ? 'break-word' : 'normal',
        'word-break': col.cellOverflowBehaviour === enumCellOverflowBehaviour.Wrap ? 'break-all' : 'normal'
      };
    }
    if (col.initialWidth > 0) {
      styles['max-width'] = col.initialWidth + 'px';
      styles['min-width'] = col.initialWidth + 'px';
      styles['width'] = col.initialWidth + 'px';
    }
    return styles;
  }

  openExcelReport() {
    this.reportTitle =
      (!this.reportTitleDefault || this.reportTitleDefault.trim().length === 0) && !this.reportTitleAllowUserEdit
        ? 'Report'
        : this.reportTitleDefault!;

    this.excelExportModalShow = true;
  }

  getExcelReport() {
    this.reportTitle = this.reportTitle?.trim();
    if (!this.reportTitle || this.reportTitle.length <= 0) {
      this.sharedService.clearToasts();
      this.sharedService.showToast("error", "REPORT NAME NOT VALID", "The report name is not valid");
      return;
    }
    const allowedPattern = /^[A-Za-z0-9 _-]*$/;
    if (!allowedPattern.test(this.reportTitle)) {
      this.sharedService.clearToasts();
      this.sharedService.showToast("error", "INVALID CHARACTERS IN REPORT NAME", "The report name contains invalid characters.");
      return;
    }
    if (this.reportIncludeTime) {
      this.reportFinalTitle = this.reportTitle + this.excelReportGetCurrentTime() + ".xlsx";
    }
    let filtersWithoutGlobalAndSelectedRows = this.modifyFiltersWithoutGlobalAndSelectedRows(this.tableLazyLoadEventInformation.filters, this.exportToExcelOptions.selectedRows); // Create filters excluding the global filter
    filtersWithoutGlobalAndSelectedRows = this.revertDateTimeZoneFilters(filtersWithoutGlobalAndSelectedRows);
    const requestData: IprimengTableDataPostWithExport = {
      page: this.currentPage, // Set the current page number
      pageSize: this.currentRowsPerPage, // Set the number of rows per page
      sort: this.tableLazyLoadEventInformation.multiSortMeta, // Set the sorting information
      filter: filtersWithoutGlobalAndSelectedRows, // Set the filters excluding the global filter
      globalFilter: this.globalSearchText, // Set the global filter text
      columns: this.columnsToShow.map(col => col.field), // Set the columns to show
      dateFormat: this.dateFormat,
      dateTimezone: this.dateTimezone,
      dateCulture: this.dateCulture,
      allColumns: this.exportToExcelOptions.allColumns,
      applyFilters: this.exportToExcelOptions.applyFilters,
      applySorts: this.exportToExcelOptions.applySorting,
      filename: this.reportFinalTitle
    };
    this.sharedService.handleHttpResponse(this.primengTableService.getExcelReport(this.reportSourceURL!, requestData), 200, false).subscribe({
      next: (response: any) => {
        this.downloadFile(response, this.reportFinalTitle, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        this.excelExportModalShow = false;
      },
      error: (error) => { // Handle error response
        this.sharedService.clearToasts();
        this.sharedService.showToast("error", "ERROR GENERATING EXCEL REPORT", `There was an error generating the Excel report ${error}`)
      }
    });
  }

  private downloadFile(data: Blob, fileName: string, contentType: string) {
    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private excelReportGetCurrentTime(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    return `_${year}${month}${day}_${hours}${minutes}${seconds}_UTC`;
  }
}