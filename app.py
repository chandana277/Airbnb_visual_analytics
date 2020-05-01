from flask import Flask, render_template, request, flash, redirect, url_for, jsonify, send_file
import pandas as pd
import seaborn as sns
import io
import matplotlib.pyplot as plot
import json
import os
from flask_cors import CORS
from sklearn.cluster import KMeans


app=Flask(__name__)
ALLOWED_EXTENSIONS = {'csv'}
CORS(app)
app.static_folder = os.path.abspath("templates/static")
app.config["JSON_SORT_KEYS"] = False

@app.route('/')

def homepage():
    
    return render_template("index.html")


@app.route('/Load_dataset', methods=['POST'])

def Load_dataset():
    if request.method == 'POST':
        global f,JsonFile
        global count
        
        
        file1=request.form.get('dataset_name')
        count=request.form.get('no_of_clusters')
        print(file1)
        print(count)
        link= "templates/datasets/"+file1
        f=pd.read_csv(link)
        global class_num
        class_num= f.iloc[:,-1].unique()
        JsonFile=json.loads(f.to_json(orient='records'))
        get_cor_mat(f)     
        load_files()
    return render_template("index.html")

@app.route('/load_files', methods=['GET'])
def load_files():
    #print(JsonFile)
    return jsonify(JsonFile)

@app.route('/color')
def color():
    JsonFile=json.loads(f.to_json(orient='records'))
    return load_files()
    
def get_cor_mat(frame):
    data={}
    global matrix
    matrix=frame.iloc[:,-1].unique()
    
    print(matrix)
    cat_var=frame.groupby(frame.iloc[:,-1])

    for i in frame.columns:
        name=i
    for classes,datapoints in cat_var:
        data[classes]=datapoints
        
    for arr in matrix:
        plot.figure()
        plots= sns.heatmap(data[arr].corr(),cmap='RdBu_r')
        plots.figure.savefig("templates/matrix_images/"+name+'-'+ str(arr) + ".png" , bbox_inches = "tight")
    return 0


@app.route('/load_images<id>')

def load_image(id):
    save_as='templates/matrix_images/'+ id + '.png'
    return send_file(save_as, mimetype='image/jpg')


@app.route('/kmeans')

def kmeans_cluster():
    #option_sel=request.form['options']
    #print(option_sel)
    #if option_sel=="cluster-based":
    #noofclusters=request.values.get('no_of_clusters')
    #print(noofclusters, type(noofclusters))
    #no=int(noofclusters)
    global temp_data
    temp_data=f.copy()   
    temp_data = temp_data.iloc[:,:-1]
    km = KMeans(n_clusters=len(class_num), init='random',n_init=10, max_iter=300, tol=1e-04, random_state=0)
    km.fit(temp_data)
    clusterid=km.labels_
    temp_data['cluster_id']=clusterid
    temp_data['cluster_id']=temp_data['cluster_id'].astype(str)
    get_cor_mat(temp_data)
    JsonFile=json.loads(temp_data.to_json(orient='records'))
    #print(JsonFile)
    #else:
    #    JsonFile=json.loads(f.to_json(orient='records'))
    return jsonify(JsonFile)
    
@app.route('/new1')
def new1():
    
    km = KMeans(n_clusters=int(count), init='random',n_init=10, max_iter=300, tol=1e-04, random_state=0)
    km.fit(temp_data)
    clusterid=km.labels_
    temp_data['cluster_id']=clusterid
    temp_data['cluster_id']=temp_data['cluster_id'].astype(str)
    get_cor_mat(temp_data)
    JsonFile=json.loads(temp_data.to_json(orient='records'))
    #print(JsonFile)
    #else:
    #    JsonFile=json.loads(f.to_json(orient='records'))
    return jsonify(JsonFile)
    



   
if __name__=="__main__":
    app.run(debug=True)