import {
  getProvinces,
  getDistricts,
  getCommunes,
  getVillages,
} from '@sothikhorn/cambodia-gazetteer';

export interface LocationItem {
  code: string;
  nameEn: string;
  nameKm: string;
}

export function getAllProvinces(): LocationItem[] {
  return getProvinces().map((p) => ({
    code: p.code,
    nameEn: p.en_name,
    nameKm: p.name,
  }));
}

export function getDistrictsByProvince(provinceCode: string): LocationItem[] {
  if (!provinceCode) return [];
  return getDistricts(provinceCode).map((d) => ({
    code: d.code,
    nameEn: d.en_name,
    nameKm: d.name,
  }));
}

export function getCommunesByDistrict(districtCode: string): LocationItem[] {
  if (!districtCode) return [];
  return getCommunes(districtCode).map((c) => ({
    code: c.code,
    nameEn: c.en_name,
    nameKm: c.name,
  }));
}

export function getVillagesByCommune(communeCode: string): LocationItem[] {
  if (!communeCode) return [];
  return getVillages(communeCode).map((v) => ({
    code: v.code,
    nameEn: v.en_name,
    nameKm: v.name,
  }));
}
