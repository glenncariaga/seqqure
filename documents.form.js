//npm modules:
import React from "react";
import deepmerge from "deepmerge";

//local files
import * as ajax from "../services/documents.service";
import * as documentTypes from "../services/documentType.service";
import * as SmartAdmin from "../helpers/stylingComponents.helpers";
import FormPanel from "../components/FormPanel";
import DropZone from "../components/DropZone";
import * as signedUrl from "../services/signedUrl.service";
import Notifier from "../helpers/notifier";

class DocuForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      document: this.clearDocumentForm(),
      file: {},
      docType: [],
      editMode: false,
      errormsg: ""
    };
  }

  clearDocumentForm = () => {
    const document = {
      escrowId: this.props.escrowId || "",
      docType: "EscDoc",
      docName: "",
      description: "",
      location: "",
      _id: "",
      latest: true,
      type: "",
      size: "",
      parent: "",
      milestoneId: this.props.milestoneId || ""
    };
    return document;
  };

  editDoc = async () => {
    if (this.isNewVersion() === false) {
      try {
        let response = await ajax.put(
          this.state.document,
          this.state.document._id
        );
        if (response.isSuccessful === true) {
          Notifier.success("Edit Successful");
          this.newDocForm();
        }
      } catch (error) {
        console.log(error);
        Notifier.error("Cannot Connect");
      }
    }
  };

  isNewVersion = () => {
    if (Object.keys(this.state.file).length !== 0) {
      let document = this.state.document;
      document.parent = document._id;
      this.setState({ document: document });
      this.newDocument();
      return true;
    }
    return false;
  };

  delDoc = async content => {
    try {
      let response = await ajax.docuDel(content._id);
      if (response.data.status === "200" || response.data.status === "201") {
        Notifier.success("Delete Successful!");
      }
    } catch (error) {
      console.log(error);
      Notifier.error("Check your connection");
    }
  };

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState(prevState => {
      const document = {
        ...prevState.document,
        [name]: value
      };
      return { document: document };
    });
  };

  newDocument = async event => {
    // check if there is a file in dropzone
    if (Object.keys(this.state.file).length === 0) {
      this.setState({ errormsg: "Need to select a file!" });
      return;
    }
    const document = this.state.document;
    delete document._id; //need to delete the field, if making a new document
    const file = this.state.file;
    try {
      let createDoc = await ajax.create(document); //the initial create.  need an id to associate the file to.
      document._id = createDoc.item;
      signedUrl.uploadFileDoc(document._id, file); //use the returned _id as file name.
      if (createDoc.isSuccessful === true) {
        Notifier.success(`${document.docName} Uploaded`);
      }
    } catch (e) {
      Notifier.error("An Error has occured");
      console.log("failed to upload file", e);
      ajax.docuDel(document._id); // if the file fails to upload, need to delete the entry on the DB for the file.
    }

    this.newDocForm(); //reset the state
    if (this.props.postSave) this.props.postSave();
  };

  fileInfo = file => {
    const document = this.state.document;
    document.docName = file.name;
    document.type = file.type;
    document.size = file.size;
    this.setState({ document: document });
    this.setState({ file: file });
  };

  cancelButton = e => {
    e.preventDefault();
    this.newDocForm();
  };

  openDocForm = doc => {
    let document = "";
    doc
      ? (document = deepmerge(this.clearDocumentForm(), doc))
      : (document = this.clearDocumentForm());
    this.setState({ document: document, editMode: true });
  };

  newDocForm = () => {
    // let escrowId = this.state.document.escrowId;
    // let milestoneId = this.state.document.milestoneId
    let document = this.clearDocumentForm();
    this.setState({ document: document, editMode: false, file: {} });
    this.props.reset(this.props.escrowId);
  };

  componentWillMount = async () => {
    try {
      let response = await documentTypes.getAll();
      this.setState({ docType: response.items });
    } catch (error) {
      console.log(`Document Type Get Error ${error}`);
    }

    // determine editmode:  if there is a props for a document, set edit mode to
    // true, and pull the document info into "documents"
    if (this.props.docId) {
      try {
        let response = await ajax.getById(this.props.docId);
        this.setState({ document: response.item, editMode: true });
      } catch (error) {
        console.log(`Escrows by ID get Error ${error}`);
      }
    }
  };
  componentWillReceiveProps = async nextProps => {
    if (!nextProps.docId) {
      this.setState({
        document: this.clearDocumentForm(),
        editMode: false
      });
    } else {
      try {
        let response = await ajax.getById(nextProps.docId);
        this.setState({ document: response.item, editMode: true });
      } catch (error) {
        console.log(`Get Document By ID Error ${error}`);
      }
      return null;
    }
  };
  render() {
    const title = (
      <React.Fragment>
        <span>
          <i className="fa fa-fw fa-file" />
          View/Edit Document
        </span>
      </React.Fragment>
    );
    return (
      <React.Fragment>
        <div className='container-fluid'>
          <FormPanel title={title}>
            <form className="smart-form">
              <div>
                <SmartAdmin.SelectSmartAdmin
                  onChange={this.handleChange}
                  label="Document Type"
                  name="docType"
                  selection={this.state.docType}
                  value={this.state.document.docType}
                />
                <SmartAdmin.InputSmartAdmin
                  onChange={this.handleChange}
                  label="Document Name"
                  name="docName"
                  value={this.state.document.docName}
                />
                <SmartAdmin.InputSmartAdmin
                  onChange={this.handleChange}
                  label="Description"
                  name="description"
                  value={this.state.document.description}
                />{" "}
                <DropZone
                  callBack={this.fileInfo}
                  errormsg={this.errormsg}
                  dropZoneSize={150}
                />
                <div className="checkbox">
                  <label className="checkbox">
                    <input
                      onChange={this.handleChange}
                      type="checkbox"
                      name="latest"
                      checked={this.state.document.latest}
                      value={this.state.document.latest}
                    />
                    <i />Is this latest Version?
                </label>
                </div>
              </div>
              {this.state.editMode ? (
                <SmartAdmin.UpdateButton
                  onClick={this.editDoc.bind(this.state.document, this)}
                />
              ) : (
                  <SmartAdmin.InsertButton
                    onClick={this.newDocument.bind(this.state.document)}
                  />
                )}
              <SmartAdmin.CancelButton onClick={this.cancelButton} />
            </form>
          </FormPanel>
        </div>
      </React.Fragment>
    );
  }
}

export default DocuForm;
