import { Response } from 'express';
import mongoose from 'mongoose';
import { strict } from 'assert';

export const slugify = (text: string) => {
    if (!text)
      return "";
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
}

export const sanitizePhoneNumber = (rawNumber: string): string[] => {
    const numberString = rawNumber != undefined ? rawNumber.replace(/\s/g, '') : '';
    let numberArray: string[] = [];

    if (numberString.indexOf('\\') > -1) {
        numberArray = numberString.split('\\');
    } else if (numberString.indexOf('/') > -1) {
        numberArray = numberString.split('/');
    } else if (numberString.indexOf(',') > -1) {
        numberArray = numberString.split(',');
    } else if (numberString.indexOf('OR') > -1) {
        numberArray = numberString.split('OR');
    } else {
        numberArray = [numberString];
    }

    var list = numberArray.map(number => {
        let num = number;
        if (number.length > 6) {
            if (number.indexOf('+') == -1) {
                if (number.charAt(0) == '0' && number.charAt(1) == '7') {
                    num = `+263${number.substr(1, number.length)}`;
                }
                else if (number.charAt(0) == '7' && number.length == 9) {
                    num = `+263${number}`;
                }
                else if (number.charAt(0) == '0' && number.charAt(1) == '0') {
                    num = `+${number.substr(2, number.length)}`;
                } else {
                    num = `+${number}`;
                }
            }
        } else {
            num = '';
        }
    
        return num;
    });
    return list;
}