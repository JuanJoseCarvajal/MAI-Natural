import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SiteContentProvider, SiteText } from '@/components/common/SiteText';
describe('published text rendering',()=>{
  it('renders saved values and preserves defaults without additional markup',()=>{
    expect(renderToStaticMarkup(<SiteContentProvider values={{title:'Título editado'}}><h1><SiteText id="title">Original</SiteText></h1><p><SiteText id="body">Texto original</SiteText></p></SiteContentProvider>)).toBe('<h1>Título editado</h1><p>Texto original</p>');
  });
  it('escapes any HTML even if the database were contaminated',()=>{
    const html=renderToStaticMarkup(<SiteContentProvider values={{title:'<script>alert(1)</script>'}}><SiteText id="title">Original</SiteText></SiteContentProvider>);
    expect(html).not.toContain('<script>');expect(html).toContain('&lt;script&gt;');
  });
});
