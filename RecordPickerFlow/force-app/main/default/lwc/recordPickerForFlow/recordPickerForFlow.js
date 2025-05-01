import { LightningElement, api, track } from 'lwc';
import { FlowAttributeChangeEvent } from "lightning/flowSupport";

export default class RecordPickerForFlow extends LightningElement {
    @track selectedRecordId;
    @api objectApiName;
    @api label;
    @api fieldName = 'Name';
    @api additionalFields = 'Name';
    @api primaryFieldMatch = 'Name';
    @api additionalFieldMatch;
    @api criteriaFieldPath;
    @api criteriaOperator;
    @api criteriaValue;
    @api filterLogic;
    @api required;
    filter;
    matchingInfo;
    changeCounter = 0;

    connectedCallback(){
        if(this.required == null) this.required = false;
        this.criteriaFieldPath = this.criteriaFieldPath.split(',');
        this.criteriaOperator = this.criteriaOperator.split(',');
        this.criteriaValue = this.criteriaValue.split(',');
        this.filter = this.createFilter();
        this.matchingInfo = this.createMatchingInfo();
    }

    @api
    get selectedRecord() {
        return this.selectedRecordId;
    }
    set selectedRecord(value) {
        this.selectedRecordId = value;
    }

    get displayInfo(){
        return {
            primaryField: this.fieldName,
            additionalFields: [this.additionalFields],
        }
    }

    @api
    validate() {
        if(this.selectedRecordId != null || this.required == false) { 
            return { isValid: true }; 
        } 
        else { 
            return { 
                isValid: false, 
                errorMessage: 'Preencha o campo!' 
            }; 
        }
    }

    createFilter(){
        if(this.criteriaFieldPath.length > 0){
            let object;
            let criteriaList = [];
            for(let i = 0; i < this.criteriaFieldPath.length; i++){
                object = {
                    fieldPath: this.criteriaFieldPath[i],
                    operator: this.criteriaOperator[i],
                    value: this.validateValueInCriteria(this.criteriaValue[i])
                }
                criteriaList.push(object);
            }
            return {
                criteria: criteriaList,
                filterLogic: this.filterLogic
            }
        }
    }

    createMatchingInfo(){
        let matchingInfo = {};
        if(this.additionalFieldMatch != null){
            return matchingInfo = {
                        primaryField: { fieldPath: this.primaryFieldMatch , mode: 'contains'},
                        additionalFields: [{ fieldPath: this.additionalFieldMatch }]
                    }
        }

        return matchingInfo = {
            primaryField: { fieldPath: this.primaryFieldMatch , mode: 'contains'},
        }
    }

    validateValueInCriteria(value){
        if(value == 'true'){
            return true;
        }else if(value == 'null'){
            return null;
        }else if(value == 'false'){
            return false;
        }else if(this.verifyDateFormat(value)){
            const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            const [, day, month, year] = value.match(regex);
            return { value: new Date(`${year}-${month}-${day}`).toISOString() };
        }else if(value.includes('literal:')){
            const valueSplit = value.split(':');
            return { literal: valueSplit[1] };
        }
        return value;
    }

    verifyDateFormat(value){
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        return regex.test(value) ? true : false;
    }

    handleInputChange(event) {
        const attributeChangeEvent = new FlowAttributeChangeEvent(
            "selectedRecord",
            event.detail.recordId,
        );
        this.dispatchEvent(attributeChangeEvent);
    }
}