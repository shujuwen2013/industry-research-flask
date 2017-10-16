# coding: utf-8

from flask import Flask, render_template
from bokeh.plotting import figure
from bokeh.embed import components
from bokeh.models import CustomJSTransform, LinearColorMapper
from bokeh.palettes import Blues6 as palette
from bokeh.layouts import gridplot
import pandas as pd
import numpy as np
from numbers import Number
from plot import price_chg_plot

app = Flask(__name__)

@app.route("/")
def index():
	
	df = pd.read_csv('static/data/df.csv')
	df_group = pd.read_csv('static/data/df_group.csv')
	df_group_agg = pd.read_csv('static/data/df_group_agg.csv')
	df_profit = pd.read_csv('static/data/df_profit.csv')
	df_profit_pred_comp = pd.read_csv('static/data/df_profit_pred_comp.csv')
	df_profit_formatted = pd.read_csv('static/data/df_profit_formatted.csv')
	df_profit_pred_comp_formatted = pd.read_csv('static/data/df_profit_pred_comp_formatted.csv')
	df_price_chg = pd.read_csv('static/data/df_price_chg.csv')
	df_price_chg_formatted = pd.read_csv('static/data/df_price_chg_formatted.csv')


	profit_columns = map(lambda x:{"title" : x}, df_profit_formatted.columns)
	profit_dataset = df_profit_formatted.values.tolist()

	profit_pred_columns = map(lambda x:{"title" : x}, df_profit_pred_comp_formatted.columns)
	profit_pred_dataset = df_profit_pred_comp_formatted.values.tolist()

	df_scatter = pd.concat([df_profit, df_profit_pred_comp, df_price_chg], axis=1)
	df_scatter = df_scatter.loc[:,~df_scatter.columns.duplicated()]

	scatter_variables = map(
		lambda x:{"text" : x}, 
		[c for c in df_scatter.columns if isinstance(df_scatter[c][0], Number)])

	id_name = u'股票简称'

	# draw plots
	# create mappers 
	palette.reverse()
	color_mapper = LinearColorMapper(palette=palette, low=-50, high=50)
	def func():
		return x
	def v_func():
		return [(x*100).toFixed(2)+'%'for x in xs]
	label_formatter = CustomJSTransform.from_py_func(func=func, v_func=v_func)
	
	price_chg_5d = price_chg_plot(
		df, 'PCT_CHG_PER-5-DAY', 'SEC_NAME', '上证流通全收益', color_mapper, label_formatter, title_text='近5天涨幅%')
	price_chg_5d_script, price_chg_5d_div = components(price_chg_5d)
	
	price_chg_10d = price_chg_plot(
		df, 'PCT_CHG_PER-10-DAY', 'SEC_NAME', '上证流通全收益', color_mapper, label_formatter, title_text='近10天涨幅%')
	price_chg_10d_script, price_chg_10d_div = components(price_chg_10d)

	price_chg_1m = price_chg_plot(
		df, 'PCT_CHG_PER-1-MONTH', 'SEC_NAME', '上证流通全收益', color_mapper, label_formatter, title_text='近1个月涨幅%')
	price_chg_1m_script, price_chg_1m_div = components(price_chg_1m)

	price_chg_3m = price_chg_plot(
		df, 'PCT_CHG_PER-3-MONTH', 'SEC_NAME', '上证流通全收益', color_mapper, label_formatter, title_text='近3个月涨幅%')
	price_chg_3m_script, price_chg_3m_div = components(price_chg_3m)

	price_chg_6m = price_chg_plot(
		df, 'PCT_CHG_PER-6-MONTH', 'SEC_NAME', '上证流通全收益', color_mapper, label_formatter, title_text='近6个月涨幅%')
	price_chg_6m_script, price_chg_6m_div = components(price_chg_6m)

	price_chg_12m = price_chg_plot(
		df, 'PCT_CHG_PER-12-MONTH', 'SEC_NAME', '上证流通全收益', color_mapper, label_formatter, title_text='近12个月涨幅%')
	price_chg_12m_script, price_chg_12m_div = components(price_chg_12m)
	
	chart_grid = gridplot([[price_chg_5d, price_chg_10d, price_chg_1m],[price_chg_3m, price_chg_6m, price_chg_12m]])
	chart_grid_script, chart_grid_div = components(chart_grid)

	return render_template(
		"index.html", 
		price_chg_5d_div=price_chg_5d_div, 
		price_chg_5d_script=price_chg_5d_script, 
		price_chg_10d_div=price_chg_10d_div, 
		price_chg_10d_script=price_chg_10d_script, 
		price_chg_1m_div=price_chg_1m_div, 
		price_chg_1m_script=price_chg_1m_script, 
		price_chg_3m_div=price_chg_3m_div, 
		price_chg_3m_script=price_chg_3m_script, 
		price_chg_6m_div=price_chg_6m_div, 
		price_chg_6m_script=price_chg_6m_script, 
		price_chg_12m_div=price_chg_12m_div, 
		price_chg_12m_script=price_chg_12m_script,
		chart_grid_script=chart_grid_script,
		chart_grid_div=chart_grid_div,

		profit_columns=profit_columns,
		profit_dataset=profit_dataset,

		profit_pred_columns=profit_pred_columns,
		profit_pred_dataset=profit_pred_dataset,

		scatter_variables=scatter_variables,
		id_name=id_name,
		scatter_data=df_scatter.to_json(orient='records'))

