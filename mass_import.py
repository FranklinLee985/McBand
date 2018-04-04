import pymongo
import json
import copy
import sys, os
from random import randint

if __name__ == '__main__':
    path = '/Users/franklinlee/Desktop/Junior Second/CSCI 3100/project/McBand/public/resources/upload/music' #This is local folder path that we will upload music
    pwd = '/resources/upload/music' #This is the relative path that we will store in the data base
    uploader = 'liwenbo'
    client = pymongo.MongoClient("localhost", 27017)
    db = client.mcband
    used_id = []
    saveData = []
    files= os.listdir(path)
    for each in files:
        file_path = os.path.join(path, each)
        if os.path.isdir(file_path):
            name_list = os.listdir(file_path)
            #print name_list
            music, picture, sheet = name_list 
            for name in name_list:
                if name[len(name)-4:] == '.pdf':
                    sheet = name
                    musicName = name[:len(name)-4]
                elif name[len(name)-4:] == '.mp3':
                    music = name
                elif name[len(name)-4:] == 'jpeg':
                    picture = name
                elif name[len(name)-4:] == '.jpg':
                    picture = name
            musicPath = os.path.join(pwd, each)
            musicPath = os.path.join(musicPath, music)
            picturePath = os.path.join(pwd, each)
            picturePath = os.path.join(picturePath, picture)
            sheetPath = os.path.join(pwd, each)
            sheetPath = os.path.join(sheetPath, sheet)
            likeCount = randint(0,1)
            musicId = randint(1,10000)
            while (musicId in used_id):
                musicId = randint(1,10000)
            used_id.append(musicId)
            saveData.append({
	            'sheetPath' : sheetPath,
                'uploader' : uploader,
	            'musicname' : musicName,
	            'likeCount' : likeCount,
	            'coverPath' : picturePath,
	            'musicPath' : musicPath,
                'musicId': str(musicId)
            })
    #print saveData[0]
    db.musicdbs.insert(saveData)
