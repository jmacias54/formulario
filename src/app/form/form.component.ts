import { Component, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import Swal from 'sweetalert2'

import flatpickr from "flatpickr";
// services
import { ApiService as API } from '../services/api.service';
// models
declare var window: any;

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  // private itemsByPage = 5;
  private modal: any;

  // numberOfPages = 1;
  // currentPage = 1;
  // itemsInPage: Array<any> = [];
  list: Array<any> = [];
  deportes: Array<any> = [];
  modoEdit: boolean = false;
  searchParams: any = {};
  dataSorts: any = {};
  inputSearchByDate: any;

  formulario: FormGroup = this.formBuilder.group({
    'idEvento' : [0],
    'fcNombreEvento' : ['', Validators.required],
    'fcDescripcion' : [''],
    'fcIdDeporte' : ['atletismo', Validators.required],
    'fdFechaIni' : ['', Validators.required],
    'fdFechaFin' : ['', Validators.required],
    'fcCanalLive': ['/en-vivo#cs01', Validators.required],
    'fcUrlVod': [''],
    'fcUrlHighligths': [''],
    'fcCeremonia': ['']
  });

  @ViewChild('fdFechaIni') fdFechaIni;
  @ViewChild('fdFechaFin') fdFechaFin;
  @ViewChild('modal') elementModal;
  @ViewChild('searchByDate') searchByDate;

  URL_LIVE = [{
      label: 'Claro sports',
      value: '/en-vivo#cs01'
    }, {
      label: 'Claro sports 1',
      value: '/en-vivo#cs02'
    }, {
      label: 'Web03',
      value: '/en-vivo#cs03'
    }, {
      label: 'Web04',
      value: '/en-vivo#cs04'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private api: API) { }

  ngOnInit() {
    let fdFechaIni = this.fdFechaIni.nativeElement;
    let fdFechaFin = this.fdFechaFin.nativeElement;
    let searchByDate = this.searchByDate.nativeElement;
    let config = {
      enableTime: true,
      time_24hr: true,
      dateFormat: "Y-m-d H:i"
    }
    flatpickr(fdFechaIni, config);
    flatpickr(fdFechaFin, config);
    this.inputSearchByDate = flatpickr(searchByDate, {mode: "range"});

    this.getListDeportes();
    this.getListItems();

    let elementModal = this.elementModal.nativeElement;
    this.modal = new window.Modal(elementModal);
  }

  private async getListDeportes() {
    let response = await this.api.post(API.END_POINTS.catDeportes, {}).toPromise();
    if (Array.isArray(response)) this.deportes = response;
  }

  private async getListItems() {
    let params = this.getDataFormat() // '2018-09-02'
    let response = await this.api.post(API.END_POINTS.findByFecha, {params}).toPromise();
    this.list = response;
    // this.initItemsInPage();
  }

  // private initItemsInPage() {
  //   if (this.list.length === 0) {
  //     this.itemsInPage = [];
  //     this.numberOfPages = 1;
  //   } else {
  //     this.numberOfPages = Math.ceil(this.list.length / this.itemsByPage);
  //     this.showDataPage(1);
  //   }
  // }

  private cloneObj(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private getDataFormat() {
    let date = new Date();
    let day: any = date.getDate();
    let month: any = date.getMonth() + 1;
    month = month.toString().length == 2 ? month : '0' + month;
    day = day.toString().length == 2 ? day : '0' + day;
    let year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  clearSearch (key) {
    this.searchParams[key] = ''
    this.getListItems()
    if (key == 'fecha') {
      this.inputSearchByDate.clear()
    }
  }

  changeDate () {
    // let fdFechaIni = this.fdFechaIni.nativeElement.valueAsNumber;
    // let fdFechaFin = this.fdFechaFin.nativeElement.valueAsNumber;
    // if (isNaN(fdFechaIni) || isNaN(fdFechaFin)) return;
    //
    // if (fdFechaIni > fdFechaFin) {
    //   Swal('La fecha inicio debe ser antes a la fecha fin');
    // }
  }

  datesIsValid () {
    let fdFechaIni = new Date(this.fdFechaIni.nativeElement.value).getTime();
    let fdFechaFin = new Date(this.fdFechaFin.nativeElement.value).getTime();
    if (isNaN(fdFechaIni) || isNaN(fdFechaFin)) {
      Swal('', 'Fechas no validas');
      return false;
    }
    if (fdFechaIni >= fdFechaFin) {
      Swal('', 'La fecha inicio debe ser anterior a la fecha fin');
      return false;
    }
    return true;
  }

  // showDataPage(page) {
  //   this.currentPage = page;
  //   var init = this.itemsByPage * (page - 1);
  //   var end = this.itemsByPage * page;
  //   if (init > this.list.length) return;
  //   this.itemsInPage = [];
  //   for (var i = init; i < end && i < this.list.length; i++ ) {
  //     this.itemsInPage.push(this.list[i]);
  //   }
  // }

  onClicknewEvent() {
    this.resetForm();
    this.modal.show();
  }

  async sendForm() {
    if (this.formulario.invalid) {
      this.markFormGroupTouched(this.formulario)
      return Swal('', 'Algunos campos son requeridos');
    }
    if (!this.datesIsValid()) return;
    let body = this.formulario.value;
    let response = await this.api.post(API.END_POINTS.insert, {body}).toPromise();
    if (response == 1) {
      this.getListItems();
      this.resetForm();
      this.modal.hide();
      // Swal('Los datos se guardaron correctamente');
    } else {
      Swal('', 'El ID de evento ya existe');
    }
  }

  async findById() {
    let params = this.searchParams.id;
    if (!params || params.toString().length < 3)
      return Swal('', 'Se requiren mínimo tres caracteres para la búsqueda');
    let response = await this.api.post(API.END_POINTS.findById, {params}).toPromise();
    this.list = response ? [response] : [];
    // this.initItemsInPage();
  }

  async findByNombre() {
    let params = this.searchParams.nombre;
    if (!params || params.toString().length < 3)
      return Swal('', 'Se requiren minimo tres caracteres para la búsqueda');
    let response = await this.api.post(API.END_POINTS.findByNombre, {params}).toPromise();
    this.list = response;
    // this.initItemsInPage();
  }

  async findByFecha() {
    if (!this.searchParams.fecha || !this.searchParams.fecha.length) return
    let range = this.searchParams.fecha.split('to');
    let body = {
      fechaInicio: range[0],
      fechaFin: range[1]
    }
    let response = await this.api.post(API.END_POINTS.findByRange, {body}).toPromise();
    this.list = response;
    // this.initItemsInPage();
  }

  async findByCanal () {
    let canal = this.searchParams.canal;
    if (!canal) return;
    let fechaInicio = '2018-09-01';
    let fechaFin = '2018-11-30';
    let body = { fechaInicio, fechaFin }
    let response = await this.api.post(API.END_POINTS.findByRange, {body}).toPromise();
    this.list = response.filter(item => item.fcCanalLive == canal);
  }

  async editItem (item) {
    let obj = this.cloneObj(item);
    delete obj.fdFechaActualizacion;
    delete obj.fdFechaCreacion;
    // obj.fdFechaFin = obj.fdFechaFin.replace(/ /g,"T");
    // obj.fdFechaIni = obj.fdFechaIni.replace(/ /g,"T");
    this.modoEdit = true;
    this.formulario.setValue(obj, {emitEvent: true});
    this.modal.show();
  }

  async deleteItem (item) {
    let resSwal = await Swal({
      title: '¿Esta seguro que quiere eliminar el evento?',
      text: "",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })
    if (resSwal.dismiss) return
    let body = {idEvento: item.idEvento}
    let response = await this.api.post(API.END_POINTS.delete, {body}).toPromise();
    if (response == 1) {
      this.getListItems();
      this.resetForm();
      Swal('', 'Se eliminó correctamente');
    } else {
      Swal('', 'Ocurrio un error al eliminar el elemento');
    }
  }

  async sendUpdate () {
    if (this.formulario.invalid) {
      this.markFormGroupTouched(this.formulario)
      return Swal('', 'Algunos campos son requeridos');
    }
    if (!this.datesIsValid()) return;
    let body = this.formulario.value;
    let response = await this.api.post(API.END_POINTS.update, {body}).toPromise();
    if (response == 1) {
      this.getListItems();
      this.resetForm();
      this.modal.hide();
      // Swal('Los datos se guardaron correctamente');
    } else {
      Swal('', 'Ocurrio un error al guargar');
    }
  }

  sort (key, isDate = false) {
    if (!this.dataSorts[key] || this.dataSorts[key] == 'desc') {
      this.dataSorts[key] = 'asc'
    } else {
      this.dataSorts[key] = 'desc'
    }
    this.list = this.list.sort((a, b) => {
      if (!isDate) {
        if (this.dataSorts[key] == 'asc') {
          return ('' + a[key]).localeCompare(b[key])
        } else {
          return ('' + b[key]).localeCompare(a[key])
        }
      } else {
        let init = new Date(a[key])
        let end = new Date(b[key])
        if (this.dataSorts[key] == 'asc') {
          return init.getTime() - end.getTime()
        } else {
          return end.getTime() - init.getTime()
        }
      }
    })
  }

  resetForm () {
    let form = {
      'idEvento' : 0,
      'fcNombreEvento' : '',
      'fcDescripcion': '',
      'fcIdDeporte' : 'atletismo',
      'fdFechaIni' : '',
      'fdFechaFin' : '',
      'fcCanalLive': '/en-vivo#cs01',
      'fcUrlVod': '',
      'fcUrlHighligths': '',
      'fcCeremonia': ''
    };
    this.modoEdit = false;
    this.formulario.setValue(form, {emitEvent: true});
    this.markFormGroupUntouched(this.formulario);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private markFormGroupUntouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsUntouched({ emitEvent: true });
    });
  }

  range(init, end) {
    var array = [];
    for (var i = init; i < end; i++) {
      array.push(i)
    }
    return array;
  }

}
