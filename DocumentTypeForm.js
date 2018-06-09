import React from "react";
import PropTypes from "prop-types";
import deepmerge from "deepmerge";

// Components
import FormPanel from "../components/FormPanel";

// Services
import * as ajax from "../services/documentType.service";
import * as milestoneService from "../services/milestone.service";

// Utilities
import {
  FormField,
  FormFieldConfig,
  validate as formFieldValidate
} from "../helpers/form.helper";
import Notifier from "../helpers/notifier";

class DocumentTypeForm extends React.Component {
  static propTypes = {
    formData: PropTypes.shape({
      _id: PropTypes.string,
      docuName: PropTypes.string,
      docuCode: PropTypes.string,
      displayOrder: PropTypes.number,
      isObsolete: PropTypes.bool
    })
  };

  static defaultProps = {
    _id: "",
    docuName: "",
    docuCode: "",
    displayOrder: "",
    isObsolete: false
  };

  static formDataConfig = {
    _id: new FormFieldConfig("ID", {
      required: { value: false }
    }),
    docuName: new FormFieldConfig("Name", {
      required: {
        value: true,
        message: "Document Type name is required"
      },
      minLength: { value: 2 },
      maxLength: { value: 50 }
    }),
    docuCode: new FormFieldConfig("Code", {
      required: {
        value: true,
        message: "Document Type code is required"
      },
      maxLength: { value: 20 }
    }),
    displayOrder: new FormFieldConfig("Display Order", {
      required: { value: true },
      number: { value: true }
    }),
    isObsolete: new FormFieldConfig("Obsolete", {
      required: { value: false }
    })
  };

  componentDidMount() {
    milestoneService
      .getAll()
      .then(data => {
        console.log(data);
        this.setState({
          itemsMilestone: data.items.sort((a, b) => {
            return a.displayOrder - b.displayOrder;
          })
        });
        console.log("Success", data);
      })
      .catch(error => {
        console.log(error);
      });
  }

  constructor(props) {
    super(props);
    const item = this.propsToFormData(props);
    this.state = {
      item: item,
      formValid: this.validateForm(item)
    };

    this.handleChange = this.handleChange.bind(this);
    this.saveType = this.saveType.bind(this);
    this.delType = this.delType.bind(this);
    this.cancelType = this.cancelType.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  validateForm(formFields) {
    return Object.values(formFields).reduce((valid, formField) => {
      return valid && formField.valid;
    }, true);
  }

  propsToFormData(nextProps) {
    let doc = deepmerge(DocumentTypeForm.defaultProps, nextProps.docType);

    const item = {
      _id: new FormField(doc._id || ""),
      docuName: new FormField(doc.docuName),
      docuCode: new FormField(doc.docuCode),
      displayOrder: new FormField(doc.displayOrder),
      isObsolete: new FormField(doc.isObsolete)
    };

    for (let fieldName in item) {
      let field = item[fieldName];
      let config = DocumentTypeForm.formDataConfig[fieldName];
      formFieldValidate(field, config);
    }

    return item;
  }

  renderErrorMsgs(field) {
    return !field.valid && field.touched
      ? field.brokenRules.map(br => {
          return (
            <div key={br.rule} className="note note-error">
              {br.msg}
            </div>
          );
        })
      : null;
  }

  inputClassName(field) {
    return !field.valid && field.touched ? "input state-error" : "input";
  }

  handleChange(event) {
    // two portions:  one checks for change of state of the field (onChange) the
    // other is to validate the input field, using rules set in formDataConfig
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    const config = DocumentTypeForm.formDataConfig[name];

    // setState changes the state for the component; displays value in the input box
    this.setState(prevState => {
      const field = { ...prevState.item[name] };

      field.value = value;
      field.touched = true; // checks if a field has been "touched," as in there had been an attempt to edit the field.
      formFieldValidate(field, config);

      const item = { ...prevState.item, [name]: field };

      // this iterator goes through the rules, for each field, returns the state of
      // the field, defining if it is "valid," if not, triggering an warning
      let formValid = this.validateForm(item);
      return { item: item, formValid: formValid };
    });
  }

  componentWillReceiveProps(nextProps) {
    const item = this.propsToFormData(nextProps);
    this.setState({ item: item, formValid: this.validateForm(item) });
  }

  saveType() {
    if (!this.state.formValid) {
      // Mark all fields as touched to display validation errors for all fields
      const formFields = JSON.parse(JSON.stringify(this.state.formFields));
      for (let fieldIdentifier in formFields) {
        formFields[fieldIdentifier].touched = false;
      }
      this.setState({ item: formFields });
      return;
    }

    const that = this;
    const item = {
      docuName: this.state.item.docuName.value,
      docuCode: this.state.item.docuCode.value,
      displayOrder: parseInt(this.state.item.displayOrder.value, 10),
      isObsolete: this.state.item.isObsolete.value
    };

    if (this.state.item._id.value) {
      item._id = this.state.item._id.value;
      ajax
        .put(item, item._id)
        .then(() => {
          Notifier.success(`Successfully edited ${item.docuName}.`);
          that.props.onEdit(item);
        })
        .catch(err =>
          Notifier.error(
            `Error when attempting to edit ${item.docuName}: ${err.message}`
          )
        );
    } else {
      ajax
        .create(item)
        .then(data => {
          Notifier.success(`Successfully created ${item.docuName}.`);
          item._id = data.item;
          that.props.onEdit(item);
        })
        .catch(err =>
          Notifier.error(
            `Error when attempting to create ${item.docuName}: ${err.message}`
          )
        );
    }
  }

  delType() {
    const item = this.state.item;
    const that = this;
    ajax
      .docuDel(item._id.value)
      .then(() => {
        Notifier.success(`Successfully deleted ${item.docuName.value}.`);
        that.props.onDelete(item._id.value);
      })
      .catch(err =>
        Notifier.error("Error when trying to delete: ", err.message)
      );
  }

  cancelType() {
    this.props.onCancel();
  }

  render() {
    const title = (
      <span>
        <i className="fa fa-fw fa-file" />
        Create/Edit Document Type
      </span>
    );

    console.log(this.state.itemsMilestone);

    return (
      <FormPanel title={title}>
        <form className="smart-form">
          <fieldset>
            <section className="hidden">
              <label className="label" htmlFor="_id">
                Id
              </label>
              <label className={this.inputClassName(this.state.item._id)}>
                <input
                  type="text"
                  name="_id"
                  value={this.state.item._id.value}
                  onChange={this.handleChange}
                />
              </label>
              {this.renderErrorMsgs(this.state.item._id)}
            </section>
            <section>
              <label className="label" htmlFor="docuName">
                Name
              </label>
              <label className={this.inputClassName(this.state.item.docuName)}>
                <input
                  type="text"
                  name="docuName"
                  value={this.state.item.docuName.value}
                  onChange={this.handleChange}
                />
              </label>
              {this.renderErrorMsgs(this.state.item.docuName)}
            </section>
            <section>
              <label className="label" htmlFor="docuCode">
                Code
              </label>
              <label className={this.inputClassName(this.state.item.docuCode)}>
                <input
                  type="text"
                  name="docuCode"
                  value={this.state.item.docuCode.value}
                  onChange={this.handleChange}
                />
              </label>
              {this.renderErrorMsgs(this.state.item.docuCode)}
            </section>
            <section>
              <label className="label" htmlFor="displayOrder">
                Display Order
              </label>
              <label
                className={this.inputClassName(this.state.item.displayOrder)}
              >
                <input
                  type="text"
                  name="displayOrder"
                  value={this.state.item.displayOrder.value}
                  onChange={this.handleChange}
                />
              </label>
              {this.renderErrorMsgs(this.state.item.displayOrder)}
            </section>
            <section>
              <label className="label" htmlFor="selectedMilestone">
                Milestone Id
              </label>
              <label className="select">
                <select
                  name="selectedMilestone"
                  /* value={this.state.selectedTenantId}
                      onChange={this.tenantSelect} */
                >
                  <option value="">Select a Milestone</option>{" "}
                  {/* {this.state.tenants.length &&
                    this.state.tenants.map((tenant, i) => (
                      <option key={i} value={tenant._id}>
                        {tenant.tenantName}
                      </option>
                    ))}{" "} */}
                </select>
                <i />
              </label>
            </section>
            <section>
              <div className="checkbox">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="isObsolete"
                    checked={this.state.item.isObsolete.value}
                    value={this.state.item.isObsolete.value}
                    onChange={this.handleChange}
                  />
                  <i />Obsolete
                </label>
              </div>
              {this.renderErrorMsgs(this.state.item.isObsolete)}
            </section>
          </fieldset>

          <div className="btn-group pull-right" role="group">
            <button
              type="button"
              onClick={this.saveType}
              className="btn btn-primary btn-sm"
              disabled={!this.state.formValid}
            >
              {this.state.item._id.value ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={this.cancelType}
              className="btn btn-warning btn-sm"
            >
              Cancel
            </button>
            {this.state.item._id.value && (
              <button
                type="button"
                onClick={this.delType}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </FormPanel>
    );
  }
}

export default DocumentTypeForm;
