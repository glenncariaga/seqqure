//modules:
import React from "react";
import moment from "moment";
import { Modal } from "react-bootstrap";
import fileDownload from "js-file-download";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

//project(local) files
import * as ajax from "../services/documents.service";
import * as signedUrl from "../services/signedUrl.service";
import DocumentForm from "../components/documents.form";

const makeDefaultState = () => ({
  documents: [],
  escrowId: "",
  docId: "",
  showForm: false,
  filtered: []
});

class DocumentMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: [],
      escrowId: "",
      docId: "",
      showForm: false,
      filtered: []
    };
  }

  resetState = () => {
    this.setState(makeDefaultState());
  };
  componentWillMount(props) {
    this.selectDocView(this.props.escrowNum);
  }
  downloadFile = async (e, doc) => {
    try {
      e.stopPropagation();
      let result = await signedUrl.downloadFileDoc(doc._id);
      fileDownload(result.data, doc.file);
    } catch (err) {
      console.log(err);
    }
  };
  newDocForm = doc => {
    this.setState({ docId: "", formToggle: true });
  };
  selectDocView = async escrowId => {
    let content = await ajax.getByEscrowId(escrowId);
    let documents = content.items;
    if (this.props.milestoneId !== "") {
      documents = documents.filter(document => {
        return this.props.milestoneId === document.milestoneId;
      });
    }
    documents = documents.map(row => {
      row.download = (
        <button
          key="row._id"
          type="button"
          onClick={e => this.downloadFile(e, row)}
        >
          Download
        </button>
      );

      return row;
    });

    this.setState({
      documents: documents,
      escrowId: escrowId,
      docId: ""
    });
  };
  closeForm = () => {
    this.setState({ showForm: false });
    this.selectDocView(this.props.escrowNum);
  };
  aggregateConst = (values, rows, name) => {
    return rows
      .filter(row => {
        return row.latest === true;
      })
      .map(row => row[name]);
  };
  render() {
    if (this.state.documents.length > 0) {
      return (
        <React.Fragment>
          <ReactTable
            className="table table-striped table-bordered table-hover"
            filterable
            showPaginationTop={true}
            showPaginationBottom={false}
            defaultPageSize={5}
            filtered={this.state.filtered}
            onFilteredChange={filtered => this.setState({ filtered })}
            SubComponent={row => {
              return (
                <div className="row">
                  <div className="col">
                    <DocumentForm
                      reset={this.closeForm}
                      docId={row.original._id}
                    />
                  </div>
                </div>
              );
            }}
            pivotBy={["parent"]}
            data={this.state.documents}
            defaultSorted={[
              {
                id: "dateModified",
                desc: true
              }
            ]}
            columns={[
              {
                columns: [
                  {
                    accessor: "parent",
                    PivotValue: e => null,
                    filterable: false,
                    width: 33
                  },
                  {
                    filterable: false,
                    Header: "Latest",
                    accessor: "latest",
                    aggregate: (values, rows) =>
                      this.aggregateConst(values, rows, "latest"),
                    Cell: row => (
                      <div className="align-self-center">
                        <input readOnly type="checkbox" checked={row.value} />
                      </div>
                    ),
                    width: 60
                  },
                  {
                    Header: "File",
                    accessor: "file",
                    aggregate: (values, rows) =>
                      this.aggregateConst(values, rows, "file")
                  },
                  {
                    filterable: false,
                    Header: "Upload Date",
                    aggregate: (values, rows) =>
                      this.aggregateConst(values, rows, "dateModified"),
                    accessor: "dateModified",
                    Cell: row => {
                      const theDate = new Date(row.value);
                      return <span>{moment(theDate).format("ll")}</span>;
                    }
                  },
                  {
                    Header: "Description",
                    aggregate: (values, rows) =>
                      this.aggregateConst(values, rows, "desc"),
                    accessor: "desc"
                  },
                  {
                    Header: "Code",
                    aggregate: (values, rows) =>
                      this.aggregateConst(values, rows, "code"),
                    id: "code",
                    accessor: "code",
                    Filter: cellInfo => {
                      if (this.state.documents.length > 0) {
                        let documents = this.state.documents;
                        const selectList = [""];
                        documents.map(document => {
                          let unique = false;
                          for (let i = 0; i < documents.length; i++) {
                            if (selectList[i] === document.code) {
                              unique = false;
                              break;
                            } else {
                              unique = document.code;
                            }
                          }
                          if (unique !== false) {
                            selectList.push(unique);
                          }
                          return null;
                        });
                        return (
                          <select
                            onChange={e => {
                              let filtered = this.state.filtered;
                              let unique = true;
                              for (let i = 0; i < filtered.length; i++) {
                                if (filtered[i].id === "code") {
                                  filtered[i].value = e.target.value;
                                  unique = false;
                                }
                              }
                              if (unique) {
                                filtered.push({
                                  id: "code",
                                  value: e.target.value
                                });
                              }
                              this.setState({ filtered: filtered });
                            }}
                          >
                            {selectList.map(option => {
                              return (
                                <React.Fragment key={option}>
                                  <option value={option}>{option}</option>
                                </React.Fragment>
                              );
                            })}
                          </select>
                        );
                      } else {
                        return null;
                      }
                    }
                  },
                  {
                    Header: "Milestone",
                    aggregate: (values, rows) =>
                      this.aggregateConst(values, rows, "milestone"),
                    accessor: "milestone"
                  },
                  {
                    Header: "Uploaded By",
                    aggregate: (values, rows) =>
                      this.aggregateConst(values, rows, "name"),
                    accessor: "name"
                  },
                  {
                    filterable: false,
                    Header: "Download File",
                    aggregate: (values, rows) =>
                      this.aggregateConst(values, rows, "download"),
                    accessor: "download"
                  }
                ]
              }
            ]}
          />

          <br />

          <Modal show={this.state.showForm}>
            <div className="modal-body">
              <div>
                <DocumentForm
                  escrowId={this.state.escrowId}
                  reset={this.closeForm}
                />
              </div>
            </div>
          </Modal>
        </React.Fragment>
      );
    } else {
      return null;
    }
  }
}
export default DocumentMain;
