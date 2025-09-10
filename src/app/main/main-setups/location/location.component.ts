import { Component, Injector } from "@angular/core";
import { MainSetupsService } from "../shared/services/main-setups.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { catchError, finalize, throwError } from "rxjs";
import { UrlHelper } from "@shared/helpers/UrlHelper";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Table } from "@node_modules/primeng/table";
import { ChangeDetectorRef } from "@angular/core";
import { GridApi, GridReadyEvent, ColDef } from "ag-grid-community";
import * as XLSX from "xlsx";
import { ViewChild, ElementRef } from "@angular/core";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";

export class Location {
  id: 0;
  name: string;
  address: string;
}

@Component({
  selector: "app-location",
  templateUrl: "./location.component.html",
})
export class LocationComponent {
  @ViewChild("fileInput") fileInput: ElementRef;
  materialType: Location = new Location();
  urlHelper = UrlHelper;
  tableData: any;
  itemForm: FormGroup;
  categoryName: String;
  rowCount: number;
  count: number;
  displayModal: boolean;
  rowData: any;
  displayModalveiw: boolean;
  editMode: boolean;
  saving: boolean;
  loading: boolean;
  skipCount: number = 0;
  maxCount: number = 10;
  tooltipMap: { [key: number]: string } = {};
  locations: { id: any; name: string; additional: string }[] = [];
  filters = {
    skipCount: this.skipCount,
    maxCount: this.maxCount,
    name: "",
  };
  rowSelection: string;
  target = "Location";
  target1 = "Location";
  currentPage = 1;
  constructor(
    injector: Injector,
    private _materialTypeService: MainSetupsService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.getAll();
  }

  fetchDropdownData(target) {
    this._materialTypeService
      .getAllSuggestion(target)
      .subscribe((response: any) => {
        const mappedData = response.items.map((item: any) => ({
          id: item?.id,
          name: item?.name,
          additional: item?.additional,
        }));
        switch (target) {
          case "Location":
            this.locations = mappedData;
            break;
          default:
            break;
        }
        this.cdr.detectChanges();
      });
  }

  getAll() {
    this.loading = true;
    this._materialTypeService
      .getAll1(this.target, this.filters)
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Error while getting data",
            life: 2000,
          });
          return throwError(error.error.error.message);
        })
      )
      .subscribe({
        next: (response) => {
          this.tableData = response.items;
          this.count = response.totalCount;
          this.tableData.forEach((item) => {
            this._materialTypeService
              .getDataView(item.id, this.target1)
              .subscribe((res) => {
                const tooltipLines = res.map(
                  (entry) => `${entry.itemName || "N/A"}`
                );
                this.tooltipMap[item.id] = tooltipLines.join("\n");
                this.cdr.detectChanges(); // Update view after each tooltip arrives
              });
          });
        },
      });
  }

  delete(id: number) {
    this.confirmationService.confirm({
      message: "Are you sure?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        this._materialTypeService
          .delete(id, this.target)
          .pipe(
            finalize(() => {}),
            catchError((error) => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: error.error.error.message,
                life: 2000,
              });
              return throwError(error.error.error.message);
            })
          )
          .subscribe({
            next: (response) => {
              this._materialTypeService.notifyCategoryUpdate();
              if (response) {
                this.messageService.add({
                  severity: "info",
                  summary: "Confirmed",
                  detail: "Deleted Successfully",
                  life: 2000,
                });
                this.getAll();
              }
            },
          });
      },
    });
  }

  show(id?: number) {
    console.log(this.displayModal);
    if (id) {
      this.editMode = true;
      this._materialTypeService
        .getData(id, this.target)
        .pipe(
          finalize(() => {}),
          catchError((error) => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: error.error.error.message,
              life: 2000,
            });
            return throwError(error.error.error.message);
          })
        )
        .subscribe({
          next: (response) => {
            this.materialType = response;
            this.displayModal = true;
            this.cdr.detectChanges();
          },
        });
    } else {
      this.editMode = false;
      this.displayModal = true;
      this.materialType = new Location();
    }
  }

  save(data?: any) {
    console.log("data in category of item", data);

    this.saving = true;
    if (data) {
      this.materialType = data;
    }
    if (!this.materialType.name) {
      this.messageService.add({
        severity: "error",
        detail: "Name is Required",
        life: 2000,
      });
      this.saving = false;
      return;
    }
    this._materialTypeService
      .create(this.materialType, this.target)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
        catchError((error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error.error.error.message,
            life: 2000,
          });
          return throwError(error.error.error.message);
        })
      )
      .subscribe({
        next: (response) => {
          const newCategory = response;

          this._materialTypeService.notifyCategoryCreated(newCategory);
          this.messageService.add({
            severity: "success",
            summary: "Confirmed",
            detail: "Saved Successfully",
            life: 2000,
          });
          this._materialTypeService.notifyCategoryUpdate();
          this.getAll();
          this.saving = false;
          this.displayModal = false;
        },
      });
  }

  update(data?: any) {
    this.saving = true;
    if (data) {
      this.materialType = data;
    }

    this._materialTypeService
      .update(this.materialType, this.target)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
        catchError((error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error.message,
            life: 2000,
          });
          return throwError(error.message);
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: "success",
            summary: "Confirmed",
            detail: "Updated Successfully",
            life: 2000,
          });
          this.getAll();
          this._materialTypeService.notifyCategoryUpdate();
          this.saving = false;
          this.displayModal = false;
        },
      });
  }
  updateView() {
    this.saving = true;

    this._materialTypeService
      .updateView(this.rowData, this.target1)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
        catchError((error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error.message,
            life: 2000,
          });
          return throwError(error.message);
        })
      )
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: "success",
            summary: "Confirmed",
            detail: "Updated Successfully",
            life: 2000,
          });
          this.getAll();
          this.saving = false;
          this.displayModalveiw = false;
        },
      });
  }
  async onPageChange(event: any) {
    this.filters.maxCount = event.rows;
    this.currentPage = event.page + 1;
    this.filters.skipCount = (this.currentPage - 1) * 10;
    this.getAll();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }
  onEnter(event: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.filters.name = inputValue;
    this._materialTypeService.getAll1(this.target, this.filters).subscribe({
      next: (response) => {
        this.tableData = response.items;
        this.count = response.totalCount;
        this.cdr.detectChanges();
      },
    });
  }

  //Bulk Upload
  bulkUploadModal = false;
  bulkUploadData: any[] = [];
  uploading = false;
  previewModalVisible = false;

  openPreview() {
    this.previewModalVisible = true;
  }
  headerMap: { [key: string]: string } = {
    Name: "name",
    Address: "address",
  };

  downloadTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template");

    const headers = Object.keys(this.headerMap);
    const row = worksheet.addRow(headers);

    // Style the header row
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "C6EFCE" }, // Light green
      };
      cell.font = {
        color: { argb: "000000" }, // Black text
        bold: true,
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    // Set column width and format as text
    worksheet.columns = headers.map(() => ({
      width: 25,
      style: { numFmt: "@" },
    }));

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Location_Upload_Template.xlsx");
    });
  }

  openBulkUpload() {
    this.bulkUploadModal = true;
    this.bulkUploadData = [];
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (fileExtension !== "xlsx") {
      this.messageService.add({
        severity: "error",
        detail: "Only .xlsx files are allowed",
        life: 2000,
      });
      this.bulkUploadData = [];
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(sheet);
        this.handleParsedData(parsed);
      } catch (err) {
        this.messageService.add({
          severity: "error",
          detail: "Error parsing file",
          life: 2000,
        });
      }
    };

    reader.readAsBinaryString(file);
  }

  handleParsedData(data: any[]) {
    if (!Array.isArray(data)) {
      this.messageService.add({
        severity: "error",
        detail: "Invalid file structure",
        life: 2000,
      });
      return;
    }

    // Map headers using headerMap
    const mapped = data.map((row: any) => {
      const mappedRow: any = {};
      for (const [header, field] of Object.entries(this.headerMap)) {
        mappedRow[field] = row[header];
      }
      return mappedRow;
    });

    // Validate that 'name' exists
    const validItems = mapped.filter((item) => item.name);

    this.bulkUploadData = validItems;

    if (!validItems.length) {
      this.messageService.add({
        severity: "warn",
        detail: "No valid records found.",
        life: 2000,
      });
    }
  }

  submitBulkUpload() {
    if (!this.bulkUploadData.length) {
      this.messageService.add({
        severity: "warn",
        detail: "No data to upload",
        life: 2000,
      });
      return;
    }

    this.uploading = true;

    this._materialTypeService
      .bulkUpload(this.target, this.bulkUploadData) // Not wrapped in { items } since you mentioned it
      .pipe(
        finalize(() => (this.uploading = false)),
        catchError((error) => {
          this.messageService.add({
            severity: "error",
            detail: error?.error?.message || "Upload failed",
            life: 2000,
          });
          return throwError(error);
        })
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            detail: "Bulk Upload Successful",
            life: 2000,
          });
          this.resetBulkUploadDialog();
          this.getAll();
          this._materialTypeService.notifyCategoryUpdate(); // Notify other tabs
        },
      });
  }

  resetBulkUploadDialog() {
    this.bulkUploadModal = false;
    this.bulkUploadData = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = "";
    }
  }

  getTooltip(item: any): string {
    const itemName = item?.itemName || "No Item";
    const unitName = item?.unitName || "No Unit";
    return `${itemName} | ${unitName}`;
  }
}
