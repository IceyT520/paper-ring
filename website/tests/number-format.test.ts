import test from 'node:test';
import assert from 'node:assert/strict';
import {formatModelNumber} from '../src/number-format';

test('large model values use grouped decimal digits instead of scientific notation',()=>{
 for(const [value,expected] of [[1000,'1,000'],[12345.67,'12,346'],[20000,'20,000'],[999.9,'1,000'],[1e21,'1,000,000,000,000,000,000,000'],[-12345.67,'-12,346']] as const){
  assert.equal(formatModelNumber(value),expected);
 }
});

test('small model values retain the existing useful display precision',()=>{
 for(const [value,expected] of [[0,'0.00'],[.15,'0.15'],[.65,'0.65'],[1,'1.0'],[1.25,'1.3'],[12.4,'12'],[-.65,'-0.65']] as const){
  assert.equal(formatModelNumber(value),expected);
 }
});

test('nonfinite values never appear as computer error notation',()=>{
 for(const value of [NaN,Infinity,-Infinity])assert.equal(formatModelNumber(value),'—');
});
