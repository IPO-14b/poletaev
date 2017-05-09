# Schedule2Calendar #

Проект для автоматизации содания файлов расписания занятий 
школьников и студентов для использования в любом современном
менеджере календарей, например 
[Google Calendar](https://calendar.google.com).

Проект доступен по адресу [ipo-14b.github.io/poletaev](https://ipo-14b.github.io/poletaev/)

## Компиляция проекта ##

Для компиляции проекта необходим [node.js](https://www.npmjs.com/) и
[grunt](http://gruntjs.com)

```bash
# Установка grunt
npm intsall -g grunt

# Установка зависимостей
npm install

# Компиляция проекта
grunt
```

Для запуска проекта для разработки (авоматическая перекомпиляция 
исходных кодов) выполните: 

```bash
grunt dev
```

Все скомпилированные файлы помещаются в каталог build
