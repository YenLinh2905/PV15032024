import React, { Component } from "react";
import Pagination from "react-js-pagination";
import {
  AiFillDashboard,
  AiFillFile,
  AiFillFileZip,
  AiOutlineMenu,
} from "react-icons/ai";
import {
  BsCheck,
  BsPersonVideo2,
  BsFillPeopleFill,
  BsFillPersonFill,
  BsChevronDown,
} from "react-icons/bs";
import { RiArrowUpFill, RiArrowDownFill } from "react-icons/ri";
import moment from "moment";
import numeral from "numeral";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./App.scss";

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenMenu: false,
      isOpen: false,
      isOpenMenuChild: false,
      isOpenDropdown: false,
      clickedSoft: false,
      menuVisible: false,
      isMobile: false,
      activePage: 5,
      data: [
        {
          Conf: 140659,
          Folio: "115",
          Room: 904,
          Payee: "Tran A Hoa",
          User: "SUPERVISOR",
          NetA: "350000",
          GrossA: "395000",
          VAT: "24",
          Payment: "0",
          Date: "2024-01-19",
        },
        {
          Conf: 123559,
          Folio: "121",
          Room: 1005,
          Payee: "Nguyen Thao Anh",
          User: "SUPERVISOR",
          NetA: "715000",
          GrossA: "728000",
          VAT: "234",
          Payment: "2",
          Date: "2024-02-29",
        },
        {
          Conf: 151259,
          Folio: "114",
          Room: 507,
          Payee: "Le B Nga",
          User: "SUPERVISOR",
          NetA: "329000",
          GrossA: "342000",
          VAT: "32",
          Payment: "0.2",
          Date: "2024-03-11",
        },
      ],
      activePage: 1,
      itemsCountPerPage: 20,
      totalItemsCount: 450,
      sort: {
        column: null,
        direction: "asc",
      },
      filteredData: [],
      searchData: "",
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.sidebarRef = React.createRef();
  }

  handleClick = () => {
    this.setState((prevState) => ({
      clickedSoft: !prevState.clickedSoft,
    }));
  };

  toggleMenuChild = () => {
    console.log("toggleMenuChild is called");
    this.setState((prevState) => ({
      isOpenMenuChild: !prevState.isOpenMenuChild,
    }));
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleOutsideClickEvent);
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleOutsideClickEvent);
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleOutsideClickEvent = (event) => {
    if (
      this.sidebarRef.current &&
      !this.sidebarRef.current.contains(event.target)
    ) {
      this.setState({ isOpen: false });
    }
  };

  toggleSidebar = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  handlePageChange(pageNumber) {
    this.setState({ activePage: pageNumber });
  }

  toggleDropdown = () => {
    this.setState((prevState) => ({
      isOpenDropdown: !prevState.isOpenDropdown,
    }));
  };

  toggleMenu(event) {
    console.log("Button clicked!");
    event.preventDefault();
    this.setState((prevState) => ({
      menuVisible: !prevState.menuVisible,
    }));
  }

  handleClickOutside(event) {
    const menu = document.querySelector(".menu");
    const aside = document.querySelector("aside");
    const liMenu = document.querySelector(".toggle-MenuChild");
    const ulMenuChild = document.querySelector(".container-menuChild");

    if (menu && aside && !aside.contains(event.target)) {
      this.setState({ isOpenMenu: false });
    }

    if (liMenu && ulMenuChild && !ulMenuChild.contains(event.target)) {
      this.setState({ isOpenMenuChild: false });
    }
  }

  sortData = (column) => {
    const { data, sort } = this.state;
    let direction = "asc";
    if (sort.column === column && sort.direction === "asc") {
      direction = "desc";
    }
    this.setState({
      data: this.sortByColumn([...data], column, direction),
      sort: { column, direction },
    });
  };

  sortByColumn = (data, column, direction) => {
    return data.sort((a, b) => {
      if (a[column] < b[column]) return direction === "asc" ? -1 : 1;
      if (a[column] > b[column]) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  handleDownloadPDF = () => {
    const { filteredData } = this.state;

    const doc = new jsPDF({
      orientation: "landscape",
    });

    const text = "Folio Information";
    const fontSize = 16;
    const textWidth =
      (doc.getStringUnitWidth(text) * fontSize) / doc.internal.scaleFactor;

    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - textWidth) / 2;

    doc.setTextColor("#0B132B");
    doc.setFontSize(16);
    doc.text(text, x, 10);

    const tableData = filteredData.map((item) => Object.values(item));

    doc.autoTable({
      head: [
        [
          "Folio",
          "Conf No.",
          "Room No.",
          "Payee",
          "User",
          "Net Amount",
          "Gross Amount",
          "VAT",
          "Payment Method",
          "Folio Generate Date",
        ],
      ],
      body: tableData,
      bodyStyles: { textColor: "#000000" },
      alternateRowStyles: { fillColor: "#F2F2F2" },
    });

    doc.save("data.pdf");
  };

  downloadCSV = () => {
    const { filteredData } = this.state;
    const columnHeaders = Object.keys(filteredData[0]);

    let csvContent =
      "data:text/csv;charset=utf-8," + columnHeaders.join(",") + "\n";

    csvContent += filteredData
      .map((row) => {
        return columnHeaders
          .map((header) => {
            // Đảm bảo rằng giá trị của cột tồn tại, nếu không sẽ trả về một chuỗi rỗng
            return row[header] !== undefined ? row[header] : "";
          })
          .join(",");
      })
      .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
  };

  downloadExcel = () => {
    const { filteredData } = this.state;

    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.json_to_sheet(filteredData);

    XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "filtered_data.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  handleSearch = (e) => {
    const searchValue = e.target.value;
    const { data } = this.state;
    const filteredData = data.filter((item) =>
      Object.values(item).some((val) => {
        if (typeof val === "number") {
          return val.toString().includes(searchValue);
        }
        if (typeof val === "string") {
          return val.toLowerCase().includes(searchValue.toLowerCase());
        }
        return false;
      })
    );
    this.setState({ filteredData, searchData: searchValue });
  };

  render() {
    const { isOpen } = this.state;
    const items = [
      { id: 1, name: "My account" },
      { id: 2, name: "Information" },
      { id: 3, name: "Log out" },
    ];
    const { sort } = this.state;
    const { filteredData, searchData } = this.state;
    const dataToRender = searchData ? filteredData : this.state.data;
    const { activePage, itemsCountPerPage, totalItemsCount } = this.state;
    const startIndex = (activePage - 1) * itemsCountPerPage;
    const endIndex = Math.min(startIndex + itemsCountPerPage, totalItemsCount);
    const currentData = dataToRender.slice(startIndex, endIndex);

    return (
      <>
        <div className="header">
          <div className="row">
            <div className="col-7 ">
              <div className="header-left">
                <button className="toggle-btn" onClick={this.toggleSidebar}>
                  {isOpen ? <AiOutlineMenu /> : <AiOutlineMenu />}
                </button>
                Welcome to your E-Invoice Page
              </div>
            </div>
            <div className="col-5">
              <div className="header-right">
                <div className="dropdown">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    onClick={this.toggleDropdown}
                  >
                    admin &nbsp; <BsChevronDown />
                  </button>
                  <div
                    className={`dropdown-menu${
                      this.state.isOpenDropdown ? " show" : ""
                    }`}
                    aria-labelledby="dropdownMenuButton"
                  >
                    {items.map((item) => (
                      <a
                        key={item.id}
                        className="dropdown-item"
                        href="#"
                        onClick={this.toggleDropdown}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          ref={this.sidebarRef}
          className={isOpen ? "sidebar open" : "sidebar"}
        >
          <aside>
            <h3 className="as-title">PA Infotel</h3>
            <ul>
              <li>
                <AiFillDashboard className="icon" />
                Dashboard
              </li>
              <li>
                <AiFillFile className="icon" />
                Opera Generated Folios
              </li>
              <li>
                <BsCheck className="icon" />
                E-Invoice Issued
              </li>
              <li>
                <BsPersonVideo2 className="icon" />
                Reservations
              </li>
              <li>
                <BsFillPeopleFill className="icon" />
                Profile
              </li>
              <li
                onClick={this.toggleMenuChild}
                className={`toggle-MenuChild ${
                  this.state.isOpenMenuChild ? "open" : ""
                }`}
              >
                <AiFillFileZip className="icon" />
                Activity Logs
                <BsChevronDown className="icon2" />
                <ul className="container-menuChild">
                  <li>New Reservation</li>
                  <li>Update Reservation</li>
                  <li>Check In</li>
                  <li>Check Out</li>
                  <li>New Profile</li>
                  <li>Update Profile</li>
                  <li>Posting Journals</li>
                </ul>
              </li>
              <li>
                <BsFillPersonFill className="icon" />
                Users
              </li>
            </ul>
          </aside>
        </div>

        <div className="main-content">
          <div className="title-data">
            <h3>Demo Hotel</h3>
            <a href="#">Home</a>
          </div>
          <div className="container-data">
            <h3>Folio Information</h3>
            <div className="button-download">
              <button onClick={this.handleDownloadPDF} className="button-left">
                PDF
              </button>
              <button onClick={this.downloadCSV}>CSV</button>
              <button onClick={this.downloadExcel} className="button-right">
                XLSX
              </button>
            </div>
            <div className="inputSearch">
              Search:
              <input
                type="text"
                value={searchData}
                onChange={this.handleSearch}
                placeholder="Search..."
              />
            </div>
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      Folio
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("Folio")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Folio" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("Folio")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Folio" &&
                              sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                    <th>
                      Conf No.
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("Conf")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Conf" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("Conf")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Conf" && sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                    <th>
                      Room No.
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("Room")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Room" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("Room")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Room" && sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                    <th>
                      Payee
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("User")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "User" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("User")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "User" && sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                    <th>
                      User
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("User")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "User" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("User")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "User" && sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                    <th>
                      Net Amount
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("NetA")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "NetA" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("NetA")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "NetA" && sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                    <th>
                      Gross Amonut
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("GrossA")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "GrossA" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("GrossA")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "GrossA" &&
                              sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                    <th>
                      VAT
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("Payee")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Payee" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("Payee")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Payee" &&
                              sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                    <th>
                      Payment Method
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("Payment")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Payment" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("Payment")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Payment" &&
                              sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                    <th>
                      Folio Generate Date
                      <span>
                        <RiArrowUpFill
                          onClick={() => this.sortData("Date")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Date" &&
                              sort.direction === "desc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                        <RiArrowDownFill
                          onClick={() => this.sortData("Date")}
                          className="iconSoft"
                          style={{
                            color:
                              sort.column === "Date" && sort.direction === "asc"
                                ? "blue"
                                : "lightgray",
                          }}
                        />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.Folio}</td>
                      <td>{item.Conf}</td>
                      <td>{item.Room}</td>
                      <td>{item.Payee}</td>
                      <td>{item.User}</td>
                      <td>{numeral(item.NetA).format("0,0")}</td>
                      <td>{numeral(item.GrossA).format("0,0")}</td>
                      <td>{item.VAT}</td>
                      <td>{numeral(item.Payment).format("0,0.0")}</td>
                      <td>{moment(item.Date).format("YYYY-MM-DD")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <Pagination
                activePage={activePage}
                itemsCountPerPage={itemsCountPerPage}
                totalItemsCount={totalItemsCount}
                pageRangeDisplayed={5}
                onChange={this.handlePageChange.bind(this)}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Menu;
