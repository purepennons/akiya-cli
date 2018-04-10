# Akiya-CLI
This is my personal command line tool

# Overview
```shell
  Usage: akiya [options] [command]

  Options:

    -v, --version                  output the version number
    -h, --help                     output usage information

  Commands:

    xls2csv <src> <dist>           convert files from xls to csv
    encode2utf8 <src> <dist>       encode files to utf-8 with specific encoding
    mergecsv2i18ncsv <src> <dist>  merge csv files (convert from po2csv) into a i18n format (writer wanted) csv file
    i18ncsv2csv <i18ncs> <dist>    convert i18n csv to origin csv files
    help [cmd]                     display help for [cmd]
```

# Support commands
## xls2csv
Convert files from xls to csv.
```shell
$ akiya xls2csv ./xls-folder ./csv-output
```

## encode2utf8
Encode files to utf-8 with specific encoding.
```shell
$ akiya encode2utf8 -c big5 -e {csv,txt} ./input-folder ./output-folder
```

## mergecsv2i18ncsv
Merge csv files (convert from `po2csv`) into a i18n format (writer wanted) csv file.
```shell
$ akiya mergecsv2i18ncsv ./input-csvs ./output-i18ncsv
```
### input csv format
```
location, source, target
.<0>text1</0>, <0>text1</0>, <0>文字1</0>
.<0>text2<1>text3</1></0>, <0>text2<1>text3</1></0>, <0>文字2<1>文字3</1></0>
```
### input folder structure
```
input-csv-files
    ├── en
    │   └── messages.csv
    └── zh_TW
        └── messages.csv
```

### i18n csv format (writer wanted)
```
"ID","ENG","CHT", ...
"<0>text1</0>","<0>text1</0>","<0>文字1</0>", ...
"<0>text2<1>text3</1></0>","<0>text2<1>text3</1></0>","<0>文字2<1>文字3</1></0>", ...
```

## i18ncsv2csv
Convert i18n csv to origin csv files.
```shell
$ akiya i18ncsv2csv tanslated-i18n.csv ./translated
```

### input i18n format
```
"ID","ENG","CHT", ...
"<0>text1</0>","<0>text1</0>","<0>文字1</0>", ...
"<0>text2<1>text3</1></0>","<0>text2<1>text3</1></0>","<0>文字2<1>文字3</1></0>", ...
```

### output folder structure
```
output-csv-files
    ├── en
    │   └── messages.csv
    └── zh_TW
        └── messages.csv
```

### output csv format
```
location, source, target
.<0>text1</0>, <0>text1</0>, <0>文字1</0>
.<0>text2<1>text3</1></0>, <0>text2<1>text3</1></0>, <0>文字2<1>文字3</1></0>
```
