import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  textColor: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        width: 100%;
        height: 100%;
      }
      .list-group {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999;
      }

      li {
        cursor: pointer;
      }
    `,
  ],
})
export class MarcadoresComponent implements AfterViewInit {
  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 15;
  center: [number, number] = [-3.618150555609441, 40.159071910275806];

  // Lista de marcadores
  marcadores: MarcadorColor[] = [];

  ngAfterViewInit() {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });

    this.leerLocalStorage();
  }

  irMarcador(marker: MarcadorColor) {
    this.mapa.flyTo({
      center: marker.marker?.getLngLat(),
    });
  }

  colorTexto(color: string) {
    const rgbval = parseInt(color.slice(1), 16);
    const r = rgbval >> 16;
    const g = (rgbval & 65280) >> 8;
    const b = rgbval & 255;
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    return brightness > 160 ? '#000000' : '#ffffff';
  }

  borrar(index: number) {
    this.marcadores[index].marker?.remove();
    this.marcadores.splice(index, 1);
    this.guardarLocalStorage();
  }

  agregarMarcador() {
    const color = '#xxxxxx'.replace(/x/g, (y) =>
      ((Math.random() * 16) | 0).toString(16)
    );

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color,
    })
      .setLngLat(this.center)
      .addTo(this.mapa);

    this.marcadores.push({
      color,
      textColor: this.colorTexto(color),
      marker: nuevoMarcador,
    });

    this.guardarLocalStorage();

    nuevoMarcador.on('dragend', () => {
      this.guardarLocalStorage();
    });
  }

  guardarLocalStorage() {
    const lngLatArr: MarcadorColor[] = [];

    this.marcadores.forEach((m) => {
      const { lng, lat } = m.marker!.getLngLat();
      lngLatArr.push({
        color: m.color,
        textColor: m.textColor,
        centro: [lng, lat],
      });
    });

    localStorage.setItem('marcadores', JSON.stringify(lngLatArr));
  }

  leerLocalStorage() {
    if (!localStorage.getItem('marcadores')) {
      return;
    }

    const lngLatArr: MarcadorColor[] = JSON.parse(
      localStorage.getItem('marcadores')!
    );

    lngLatArr.forEach((m) => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true,
      })
        .setLngLat(m.centro!)
        .addTo(this.mapa);
      this.marcadores.push({
        marker: newMarker,
        color: m.color,
        textColor: m.textColor,
      });

      newMarker.on('dragend', () => {
        this.guardarLocalStorage();
      });
    });

    console.log(lngLatArr);
  }
}
