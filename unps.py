from flask import Flask, render_template, jsonify, request, flash, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
# import logging
# from wtforms import StringField, SubmitField, TextAreaField, DateTimeField, FileField, IntegerField, PasswordField, BooleanField
# from wtforms.validators import DataRequired, Email, EqualTo, ValidationError
# from datetime import datetime, timezone
# import os
# from flask_wtf import FlaskForm
# import pandas as pd
# import numpy as np
# from sqlalchemy import func
# import collections
# import uuid
from flask_login import login_user, current_user, logout_user, login_required, UserMixin, LoginManager
# from flask_bcrypt import Bcrypt
# from werkzeug.utils import secure_filename
# from itsdangerous import URLSafeTimedSerializer, SignatureExpired
# from flask_mail import Message, Mail



app = Flask(__name__)
app.config['SECRET_KEY'] = 'cc5738ac48c81fb7d502409a3b6c3d0d'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://fikilek@innopen.co.za:FkInoPen!2#@localhost/ireps'
app.config['ALLOWED_EXTENSIONS'] = set(['csv'])

# app.config['MAIL_SERVER'] = 'smtp.innopen.co.za'
# app.config['MAIL_PORT'] = 587
# app.config['MAIL_USERNAME'] = 'ireps@innopen.co.za'
# app.config['MAIL_PASSWORD'] = 'FkInoPen!2#'
# app.config['MAIL_USE_TLS'] = False
# app.config['MAIL_USE_SSL'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)
# bcrypt = Bcrypt(app)
# mail = Mail(app)

login_manager = LoginManager(app)
login_manager.login_view = 'unp_signin'
login_manager.login_message_category = 'info'


########################################################################################################################
# model - UsersNaturalPerson(s) [unp and unps]
########################################################################################################################

class UsersNaturalPerson(db.Model, UserMixin):
    __tablename__ = 'users_natural_person_unp'
    unp_a01_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    unp_a02_surname = db.Column(db.String())
    unp_a03_name = db.Column(db.String())
    unp_a04_identity_no = db.Column(db.String())
    unp_a05_email = db.Column(db.String(), unique=True, nullable=False)
    unp_a06_email_verified_on_datetime = db.Column(db.DateTime())
    unp_a07_mobile_no = db.Column(db.String())
    unp_a08_mobile_no_verified_on_datetime = db.Column(db.DateTime())
    unp_a09_home_adr_id = db.Column(db.Integer)
    unp_a10_password = db.Column(db.String())
    unp_a11_password_reset_on_datetime = db.Column(db.DateTime())
    unp_a12_log_on_at_datetime = db.Column(db.DateTime())
    unp_a13_log_out_at_datetime = db.Column(db.DateTime())
    unp_a14_urs_id = db.Column(db.String())
    unp_a15_created_on_datetime = db.Column(db.DateTime())
    unp_a16_active = db.Column(db.Boolean())

    def get_id(self):
        return self.unp_a01_id

    def is_active(self):
        """True, as all users are active."""
        # return True
        return UsersNaturalPerson.query.filter_by(unp_a01_id=self.unp_a01_id).first().unp_a16_active

    def is_authenticated(self):
        """Return True if the user is authenticated."""
        return self.authenticated

    def is_anonymous(self):
        """False, as anonymous users aren't supported."""
        return False

class UsersNaturalPersonSchema(ma.ModelSchema):
    class Meta:
        model = UsersNaturalPerson

@app.route("/get_unps_data", methods=['POST'])
def get_unps_data():
    """unps route is used to collect all ireps unps data for the utility or municipality"""
    unps = UsersNaturalPerson.query.order_by("unp_a01_id").all()
    # import pdb; pdb.set_trace()
    unps_schema = UsersNaturalPersonSchema(many=True)
    output = unps_schema.dump(unps).data
    return jsonify(output)


########################################################################################################################
# model - UsersNaturalPerson(s) [unp and unps]
########################################################################################################################

########################################################################################################################
# model - AssetCategories
########################################################################################################################


class AssetCategories(db.Model):
    __tablename__ = 'asset_register_category_arc'
    arc_a01_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    arc_a02_name = db.Column(db.String())
    arc_a03_description = db.Column(db.String())
    arc_a04_code = db.Column(db.String())
    arc_a05_type = db.Column(db.String())


class AssetCategoriesSchema(ma.ModelSchema):
    class Meta:
        model = AssetCategories


@app.route("/get_arc_data", methods=['POST'])
def get_arc_data():
    """arc_data route is used to collect all data about ireps asset register categories data"""
    asset_register_category_data = AssetCategories.query.all()
    arc_data_schema = AssetCategoriesSchema(many=True)
    output = arc_data_schema.dump(asset_register_category_data).data
    return jsonify(output)


########################################################################################################################
# model - AssetCategories
########################################################################################################################


@app.route("/<ml1>/<ml2>/<ml3>")
def idt(ml1='', ml2='', ml3=''):
    return render_template("idt.html", ml1=ml1, ml2=ml2, ml3=ml3)


@app.route("/")
def index():
    return render_template("index.html", filename="index")



if __name__ == "__main__":
    app.run(debug=True)



