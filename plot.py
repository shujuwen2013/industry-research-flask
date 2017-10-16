# coding: utf-8
from bokeh.plotting import figure
from bokeh.embed import components
from bokeh.models import ColumnDataSource, LinearColorMapper, Span, LabelSet, Title
from bokeh.palettes import Blues6 as palette
import pandas as pd
import numpy as np
from numbers import Number

def price_chg_plot(df, col_val, col_name, index_name, color_mapper, 
	label_formatter, plot_width=350, plot_height=700, bar_height=0.5,
	label_font_size='6pt', title_text='涨幅%'):
    
    df = df.copy()
    # create data source from dataframe
    source = ColumnDataSource(data=df.to_dict('list'))
    
    # get value range
    sorted_value_list  = df.sort_values(col_val)[col_val].values.tolist()
    x_range = [sorted_value_list[0]*1.1, sorted_value_list[-1]*1.1] 
    
    # get sec name list sorted by value
    sorted_name_list = df.sort_values(col_val)[col_name].values.tolist()
    
    # create a figure
    p = figure(y_range=sorted_name_list, x_range=x_range, plot_width=plot_width, plot_height=plot_height)

    p.xaxis.axis_label_text_font_size = "4pt"
    p.yaxis.axis_label_text_font_size = "4pt"

    # create bars
    p.hbar(y=col_name, height=bar_height, left=0, right=col_val, color={'field':col_val,'transform':color_mapper}, source=source)

    # create a segment at index row
    p.segment([x_range[0]],[index_name],[x_range[1]],[index_name], line_color='green', line_dash='dashed')
    
    # create labels
    labels = LabelSet(x=col_val, y=col_name, text={'field':col_val,'transform':label_formatter}, source=source,                       level='glyph', x_offset=5, y_offset=0,                       text_font_size=label_font_size, text_align='left', text_baseline='middle',                      render_mode='canvas')
    # create zero span
    zero_span = Span(location=0, dimension='height')

    p.add_layout(Title(text=title_text, align='center'), 'above')
    p.add_layout(labels)
    p.add_layout(zero_span)
    
    return p