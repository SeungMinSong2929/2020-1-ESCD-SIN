import mysql.connector

def sql(querry, val):
    # Open database connection
    try: 
        mydb = mysql.connector.connect(
            host="localhost",
            user="root",
            passwd="huong",
            database="voice_db"
        )

        # prepare a cursor object using cursor() method
        mycursor = mydb.cursor()

        # run querry
        mycursor.execute(querry, val)

        # commit database
        mydb.commit()
    except Exception as e: 
        print("Database connection fail", e)

def sqlSelect(querry, val):
    # Open database connection
    try: 
        mydb = mysql.connector.connect(
            host="localhost",
            user="root",
            passwd="huong",
            database="voice_db"
        )

        # prepare a cursor object using cursor() method
        mycursor = mydb.cursor()

        # run querry
        val = (val,)
        mycursor.execute(querry, val)

        myresult = mycursor.fetchall()

        
        # commit database
        mydb.commit()

        return myresult
    except Exception as e: 
        print("Database connection fail", e)
