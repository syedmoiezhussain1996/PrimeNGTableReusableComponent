import { Component, OnInit, ViewChild } from '@angular/core';
import { enumTableViewSaveMode, PrimengTableComponent } from '../primeng-table/primeng-table.component';


// import { SharedService } from '../../services/shared/shared.service';
import { PrimengTableService } from '../../services/primeng-table/primengTable.service';
import { SharedService } from '../../services/shared/shared.service';

import { IPrimengPredifinedFilter } from '../../interfaces/primeng/iprimeng-predifined-filter';
import { IEmploymentStatus } from '../../interfaces/iemployment-status';
import { IprimengActionButtons } from '../../interfaces/primeng/iprimeng-action-buttons';
import { PrimengTableSourceComponent } from '../primeng-table-dataSource/primeng-table-dataSource.component';
import { IprimengColumnsAndAllowedPagination } from '../../interfaces/primeng/iprimeng-columns-and-allowed-pagination';
import { IprimengTableDataReturn } from '../../interfaces/primeng/iprimeng-table-data-return';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {


  constructor(private sharedService: SharedService, private primengTableService: PrimengTableService) { }
  @ViewChild('dt') dt!: PrimengTableComponent; // Get the reference to the object table
  @ViewChild('dt2') dt2!: PrimengTableSourceComponent; // Get the reference to the object table
  enumTableViewSaveMode = enumTableViewSaveMode;
  dataSource!: IprimengTableDataReturn;
  columnsSource!: IprimengColumnsAndAllowedPagination;
  employmentStatusPredifinedFilter: IPrimengPredifinedFilter[] = []; // Contains the data for the possible employment statuses
  predifinedFiltersCollection: { [key: string]: IPrimengPredifinedFilter[] } = {
    'employmentStatusPredifinedFilter': this.employmentStatusPredifinedFilter
  };

  headerActionButtons: IprimengActionButtons[] = [
    {
      icon: 'pi pi-file',
      color: 'p-button-success',
      action: () => {
        this.sharedService.clearToasts();
        this.sharedService.showToast("info", "Clicked on create a new record", "Here you will for example show a modal to create a new record. Upon creating the record, you can do 'this.dt.updateDataExternal()' to refresh the table data and show the newly created record.");
      },
      label: "CREATE",
      tooltip: "Create new record"
    }
  ];
  rowActionButtons: IprimengActionButtons[] = [
    {
      icon: 'pi pi-trash',
      tooltip: 'Delete record',
      color: 'p-button-danger',
      action: (rowData) => {
        this.sharedService.showToast("warn", "Clicked on delete row", `The record ID is\n\n${rowData.rowID}\n\nThis button only appears if a condition is met. Remember that a backend validation should be done anyways because users can tamper with the exposed variables in the frontend.`);
      },
      condition: (rowData) => (rowData.canBeDeleted === true)
    }, {
      icon: 'pi pi-file-edit',
      tooltip: 'Edit record',
      color: 'p-button-primary',
      action: (rowData) => {
        this.sharedService.showToast("success", "Clicked on edit row", `The record ID is\n\n${rowData.rowID}\n\nHere you could open a modal for the user to edit this record (you can retrieve data through the ID) and then call 'this.dt.updateDataExternal()' to refresh the table data.`);
      }
    }
  ];

  ngOnInit(): void {
    this.getEmploymentStatus(); // Retrieve the possible employment status
    this.sharedService.handleHttpResponse(this.primengTableService.fetchTableColumnsAndAllowedPaginations('Main/TestGetCols')).subscribe({
      next: (responseData: IprimengColumnsAndAllowedPagination) => {
        this.columnsSource.allowedItemsPerPage = responseData.allowedItemsPerPage;
        this.columnsSource.columnsInfo = responseData.columnsInfo;
        this.columnsSource.dateFormat = responseData.dateFormat;
        this.columnsSource.dateTimezone = responseData.dateTimezone;
        this.columnsSource.dateCulture = responseData.dateCulture;

        // if (this.getInitialWidths) {
        //   setTimeout(() => {
        //     this.initialColumnWidths = this.primengTableViewsService.computeColumnWidths(this.dt);
        //     this.initialTableWidth = this.primengTableViewsService.computeTableWidth(this.dt);
        //     this.getInitialWidths = false;
        //   }, 1);
        // }
        // if (clearTableView) {
        //   this.clearFilters(this.dt, true);
        //   this.clearSorts(this.dt, true);
        //   this.dt.tableWidthState = this.initialTableWidth;
        //   this.dt.columnWidthsState = this.initialColumnWidths;
        //   this.dt.restoreColumnWidths()
        //   this.tableLazyLoadEventInformation.multiSortMeta = [];
        // }
        // setTimeout(() => {
        //   this.columnsFetched = true; // Indicate that we have fetched the columns
        //   this.canPerformActions = true;
        //   this.updateData(this.tableLazyLoadEventInformation, continueAction, uponContinueActionEndModalHttp); // Update data with the fetched columns and execute continue action if provided
        // }, 450); // We need this delay so it doesn't launch another call
      },
      error: (err: any) => { // Handle error response
        this.sharedService.dataFecthError("ERROR IN GET COLUMNS AND ALLOWED PAGINATIONS", err); // Log the error
      }
    });
  }
  private getEmploymentStatus() {
    this.sharedService.handleHttpResponse(this.sharedService.handleHttpGetRequest<IEmploymentStatus[]>(`Main/GetEmploymentStatus`)).subscribe({
      next: (responseData: IEmploymentStatus[]) => {
        responseData.forEach((data) => {
          this.employmentStatusPredifinedFilter.push({
            value: data.statusName,
            name: data.statusName,
            displayTag: true,
            tagStyle: {
              background: `rgb(${data.colorR}, ${data.colorG}, ${data.colorB})`
            }
          })
        });
        this.dt.updateDataExternal(); // Get data for the table (columns + data)
      },
      error: err => {
        this.sharedService.dataFecthError("ERROR IN GET EMPLOYMENT STATUS", err);
      }
    });
  }

  rowSelect($event: any) {
    if ($event.selected) { // If the row has been selected
      this.sharedService.clearToasts();
      this.sharedService.showToast("info", "ROW SELECT", `The row with ID ${$event.rowID} has been selected.`);
    } else { // If the row has been unselected
      this.sharedService.clearToasts();
      this.sharedService.showToast("info", "ROW UNSELECT", `The row with ID ${$event.rowID} has been unselected.`);
    }
  }
}