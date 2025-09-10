import { Component, Injector, OnInit, Input } from "@angular/core";
import { AppComponentBase } from "@shared/app-component-base";
import {
  Router,
  RouterEvent,
  NavigationEnd,
  PRIMARY_OUTLET,
} from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { MenuItem } from "@shared/layout/menu-item";

@Component({
  selector: "sidebar-menu",
  templateUrl: "./sidebar-menu.component.html",
})
export class SidebarMenuComponent extends AppComponentBase implements OnInit {
  @Input() sidebarExpanded: boolean = true;

  menuItems: MenuItem[];
  menuItemsMap: { [key: number]: MenuItem } = {};
  activatedMenuItems: MenuItem[] = [];
  routerEvents: BehaviorSubject<RouterEvent> = new BehaviorSubject(undefined);
  homeRoute = "/main/dashboard/dashboard";

  constructor(injector: Injector, private router: Router) {
    super(injector);
    console.log("SideBaar Menu ", this.sidebarExpanded);
  }

  ngOnInit(): void {
    this.menuItems = this.getMenuItems();
    this.patchMenuItems(this.menuItems);

    this.router.events.subscribe((event: NavigationEnd) => {
      const currentUrl = event.url !== "/" ? event.url : this.homeRoute;
      const primaryUrlSegmentGroup =
        this.router.parseUrl(currentUrl).root.children[PRIMARY_OUTLET];
      if (primaryUrlSegmentGroup) {
        this.activateMenuItems("/" + primaryUrlSegmentGroup.toString());
      }
    });
    this.deactivateMenuItems(this.menuItems);
    const activeRoute =
      localStorage.getItem("activeMenuRoute") || this.router.url;
    this.setActiveMenuItem(activeRoute);
    this.restoreMenuState();
    this.highlightActiveMenu();
  }

  getMenuItems(): MenuItem[] {
    return [
      new MenuItem(
        this.l("Dashboard"),
        "main/dashboard/dashboard",
        "fas fa-chart-line",
        ""
      ),

      new MenuItem(this.l("Products"), "", " fas fa-cogs", "", [
        new MenuItem(
          this.l("Items"),
          "/app/main/main-setups/items",
          "fas fa-box",
          ""
        ),
      ]),
      new MenuItem(this.l("General Setups"), "", " fa-user fas fa-tools", "", [
        new MenuItem(
          this.l("Vendors"),
          "/app/main/main-setups/vendors",
          "fas fa-balance-scale",
          ""
        ),
        new MenuItem(
          this.l("Locations"),
          "/app/main/main-setups/location",
          "fas fa-map-marker",
          ""
        ),
        // new MenuItem(
        //   this.l("Unit"),
        //   "/app/main/main-setups/unit-of-measure",
        //   "fas fa-balance-scale",
        //   ""
        // ),
        // new MenuItem(
        //   this.l("Payment Terms"),
        //   "/app/main/main-setups/payment-terms",
        //   "fas fa-file-invoice-dollar",
        //   ""
        // ),
        // new MenuItem(
        //   this.l("WareHouse"),
        //   "/app/main/purchase/warehouse",
        //   "fas fa-warehouse",
        //   ""
        // ),
        // new MenuItem(
        //   this.l("Default Integrations"),
        //   "/app/main/main-setups/default-integrations",
        //   "fas fa-link",
        //   ""
        // ),
        // new MenuItem(
        //   this.l("Warehouse Stock Adjustment"),
        //   "/app/main/main-setups/warehouse-stock-adjustment",
        //   "fas fa-boxes",
        //   ""
        // ),
        // new MenuItem(
        //   this.l("Day Book"),
        //   "/app/main/main-setups/daybook",
        //   "fas fa-book",
        //   ""
        // ),
      ]),

      new MenuItem(
        this.l("Purchase Management"),
        "",
        " fa-user fas fa-clipboard-list",
        "",
        [
          // new MenuItem(
          //   this.l("Purchase Order"),
          //   "/app/main/purchase/purchase-order",
          //   "fas fa-truck",
          //   ""
          // ),
          new MenuItem(
            this.l("Purchase Invoice"),
            "/app/main/purchase/purchase-invoice",
            "fas fa-file-invoice",
            ""
          ),
          // new MenuItem(
          //   this.l("Purchase Return"),
          //   "/app/main/purchase/purchase-return",
          //   "fas fa-exchange-alt",
          //   ""
          // ),
          // new MenuItem(
          //   this.l("Demand Book"),
          //   "/app/main/purchase/demand-book",
          //   "fas fa-book",
          //   ""
          // ),
        ]
      ),

      // new MenuItem(
      //   this.l("Sales Management"),
      //   "",
      //   " fa-user fas fa-handshake",
      //   "",
      //   [
      //     new MenuItem(
      //       this.l("Sales Order"),
      //       "/app/main/sales/sales-order",
      //       "fas fa-cart-plus",
      //       ""
      //     ),
      //     new MenuItem(
      //       this.l("Sales Invoice"),
      //       "/app/main/sales/sales-invoice",
      //       "fas fa-file-invoice-dollar",
      //       ""
      //     ),
      //     new MenuItem(
      //       this.l("Sales Return"),
      //       "/app/main/sales/sales-return",
      //       "fas fa-money-bill-transfer",
      //       ""
      //     ),
      //     new MenuItem(
      //       this.l("Sales Commission Policy"),
      //       "/app/main/sales/sale-commition-policy",
      //       "fas fa-hand-holding-dollar",
      //       ""
      //     ),
      //     new MenuItem(
      //       this.l("Sales Tracking"),
      //       "/app/main/sales/sale-tracing",
      //       "fas fa-chart-column",
      //       ""
      //     ),
      //   ]
      // ),

      // new MenuItem(this.l("Finance"), "", " fas fa-money-check-alt", "", [
      //   new MenuItem(
      //     this.l("Bank Payments"),
      //     "/app/main/finance/bank-payment",
      //     "fas fa-university",
      //     ""
      //   ),
      //   new MenuItem(
      //     this.l("Cash Payments"),
      //     "/app/main/finance/cash-payment",
      //     "fas fa-money-bill",
      //     ""
      //   ),
      //   new MenuItem(
      //     this.l("Bank Receipt"),
      //     "/app/main/finance/bank-receipt",
      //     "fas fa-money-check-alt",
      //     ""
      //   ),
      //   new MenuItem(
      //     this.l("Cash Receipt"),
      //     "/app/main/finance/cash-receipt",
      //     "fas fa-cash-register",
      //     ""
      //   ),
      //   new MenuItem(
      //     this.l("Journal Voucher"),
      //     "/app/main/finance/journal-voucher",
      //     "fas fa-receipt",
      //     ""
      //   ),
      //   new MenuItem(
      //     this.l("General Note"),
      //     "/app/main/finance/general-note",
      //     "fas fa-note-sticky",
      //     ""
      //   ),
      //   new MenuItem(
      //     this.l("Profit Loss Note"),
      //     "/app/main/finance/profit-loss-note",
      //     "fas fa-note-sticky",
      //     ""
      //   ),
      //   new MenuItem(
      //     this.l("Accounts Openings"),
      //     "/app/main/finance/account-openings",
      //     "fas fa-cash-register",
      //     ""
      //   ),
      // ]),

      new MenuItem(this.l("User Management"), "", " fas fa-user-gear", "", [
        new MenuItem(
          this.l("Roles"),
          "/app/roles",
          "fas fa-theater-masks",
          "Pages.Roles"
        ),
        new MenuItem(
          this.l("Tenants"),
          "/app/tenants",
          "fas fa-building",
          "Pages.Tenants"
        ),
        new MenuItem(
          this.l("Users"),
          "/app/users",
          "fas fa-users",
          "Pages.Users"
        ),
      ]),

      // new MenuItem(this.l("Reports"), "", "fas fa-file", "", [
      //   new MenuItem(
      //     this.l("SSRS Reports"),
      //     "main/reports/ssrs-reports",
      //     "fas fa-file",
      //     ""
      //   ),
      // ]),
    ];
  }

  patchMenuItems(items: MenuItem[], parentId?: number): void {
    items.forEach((item: MenuItem, index: number) => {
      item.id = parentId ? Number(parentId + "" + (index + 1)) : index + 1;
      if (parentId) {
        item.parentId = parentId;
      }
      if (parentId || item.children) {
        this.menuItemsMap[item.id] = item;
      }
      if (item.children) {
        this.patchMenuItems(item.children, item.id);
      }
    });
  }

  activateMenuItems(url: string): void {
    this.deactivateMenuItems(this.menuItems);
    this.activatedMenuItems = [];
    const foundedItems = this.findMenuItemsByUrl(url, this.menuItems);
    foundedItems.forEach((item) => {
      this.activateMenuItem(item);
    });
  }

  deactivateMenuItems(items: MenuItem[]): void {
    items.forEach((item: MenuItem) => {
      item.isActive = false;
      item.isCollapsed = true;
      if (item.children) {
        this.deactivateMenuItems(item.children);
      }
    });
  }

  findMenuItemsByUrl(
    url: string,
    items: MenuItem[],
    foundedItems: MenuItem[] = []
  ): MenuItem[] {
    items.forEach((item: MenuItem) => {
      if (item.route === url) {
        foundedItems.push(item);
      } else if (item.children) {
        this.findMenuItemsByUrl(url, item.children, foundedItems);
      }
    });
    return foundedItems;
  }

  activateMenuItem(item: MenuItem): void {
    item.isActive = true;
    if (item.children) {
      item.isCollapsed = false;
    }
    this.activatedMenuItems.push(item);
    if (item.parentId) {
      this.activateMenuItem(this.menuItemsMap[item.parentId]);
    }
  }

  isMenuItemVisible(item: MenuItem): boolean {
    if (!item.permissionName) {
      return true;
    }
    return this.permission.isGranted(item.permissionName);
  }
  setActiveMenuItem(route: string): void {
    const setActive = (items: any[]) => {
      items.forEach((item) => {
        item.isActive = item.route === route;
        if (item.children) {
          setActive(item.children);
        }
      });
    };
    setActive(this.menuItems);
  }
  onMenuItemClick(route: string): void {
    localStorage.setItem("activeMenuRoute", route);
    this.activateMenuItems(route);
  }

  toggleCollapse(item: any): void {
    item.isCollapsed = !item.isCollapsed;
    this.persistMenuState();
  }

  persistMenuState(): void {
    const menuState = this.menuItems.map((item) => ({
      label: item.label,
      isCollapsed: item.isCollapsed,
    }));
    localStorage.setItem("menuState", JSON.stringify(menuState));
  }

  restoreMenuState(): void {
    const savedState = localStorage.getItem("menuState");
    if (savedState) {
      const menuState = JSON.parse(savedState);
      this.menuItems.forEach((item) => {
        const savedItem = menuState.find(
          (state: any) => state.label === item.label
        );
        if (savedItem) {
          item.isCollapsed = savedItem.isCollapsed;
        }
      });
    }
  }

  highlightActiveMenu(): void {
    const currentRoute = this.router.url;

    this.menuItems.forEach((item) => {
      // Check if the current route matches this item or its children
      item.isActive = this.isRouteActive(item, currentRoute);
    });
  }

  isRouteActive(item: any, currentRoute: string): boolean {
    if (item.route === currentRoute) {
      return true;
    }
    if (item.children) {
      return item.children.some((child: any) =>
        this.isRouteActive(child, currentRoute)
      );
    }
    return false;
  }
}
