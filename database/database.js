import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('memorydb.db');

const createTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      'create table if not exists memory (id integer primary key not null, quote text, latitude real, longitude real, image text, city text, date text, audio text);',
      [],
      () => console.log('Table created successfully'),
      error => console.error("Error creating table:", error)
    );
  });
};

const fetchMemories = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('select * from memory;', [], (_, { rows }) => {
        resolve(rows._array);
      }, (error) => {
        console.error("Error fetching memories:", error);
        reject(error);
      });
    });
  });
};

const insertMemory = (quote, latitude, longitude, image, city, currentDate, audio) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('insert into memory (quote, latitude, longitude, image, city, date, audio) values (?, ?, ?, ?, ?, ?, ?);', [quote, latitude, longitude, image, city, currentDate, audio],
        (_, result) => resolve(result),
        error => {
          console.error("Error inserting memory:", error);
          reject(error);
        });
    });
  });
};

const deleteMemory = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('delete from memory where id = ?;', [id],
        (_, result) => resolve(result),
        error => {
          console.error("Error deleting memory:", error);
          reject(error);
        });
    });
  });
};

const updateMemory = (id, newQuote, newLatitude, newLongitude, newImage, newCity, newAudio) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('update memory set quote = ?, latitude = ?, longitude = ?, image = ?, city = ?, audio = ? where id = ?;', [newQuote, newLatitude, newLongitude, newImage, newCity, newAudio, id],
        (_, result) => resolve(result),
        error => {
          console.error("Error updating memory:", error);
          reject(error);
        });
    });
  });
};

const dropTable = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DROP TABLE IF EXISTS memory;',
        [],
        () => {
          console.log('Table dropped successfully');
          resolve();
        },
        error => {
          console.error("Error dropping table:", error);
          reject(error);
        }
      );
    });
  });
};

export { createTable, fetchMemories, insertMemory, deleteMemory, dropTable, updateMemory };
