#!/usr/bin/env node
const fs = require('fs');
const prog = require('caporal');
const os = require('os');
const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const path = require('path');
const readline = require('readline');

prog.version('1.0.0')
    .command('lowercase','Change string to lowercase')
    .argument('<word>','Input string here')
    .action(function(args,options,logger){
        console.log(args.word.toLowerCase());
    })
    .command('uppercase','Change string to uppercase')
    .argument('<word>','Input string here')
    .action(function(args,options,logger){
        logger.info(args.word.toUpperCase()); 
    })
    .command('capitalize','Change string to capitalize')
    .argument('<word>','Input string here')
    .action(function(args,options,logger){
        let toArr = args.word.split(" ");
        let result = [];
        toArr.map(x => {
            result.push(x[0].toUpperCase() + x.slice(1).toLowerCase());
        });

        let finish = result.join(" ");
        console.log(finish);
    })
    .command('add','Sum the input')
    .argument('[numbers...]','Insert number here')
    .action(function(args,options,logger){
        let result = args.numbers.reduce(function(a,b){
            return parseInt(a) + parseInt(b)
        });
        logger.info(result);
    })
    .command('subtract','Subtract the input')
    .argument('[numbers...]','Insert number here')
    .action(function(args,options,logger){
        let result = args.numbers.reduce(function(a,b){
            return parseInt(a) - parseInt(b)
        });
        logger.info(result);
    })
    .command('multiply','Multiply the input')
    .argument('[numbers...]','Insert the number here')
    .action(function(args,options,logger){
        let result = args.numbers.reduce(function(a,b){
            return parseInt(a) * parseInt(b)
        });
        logger.info(result);
    })
    .command('divide','Divide the input')
    .argument('[numbers...]','Insert the number here')
    .action(function(args,options,logger){
        let result = args.numbers.reduce(function(a,b){
            return parseInt(a) / parseInt(b)
        });
        logger.info(result);
    })
    .command('palindrome','Check palindrome words')
    .argument('<sentence>','Insert the word to check here')
    .action(function(args,options,logger){
        let sentence = args.sentence;
        let toCheck = sentence.replace(/\W/g,'').toLowerCase();
        let reversed = '';

        for(let i = toCheck.length - 1; i >= 0 ; i--){
            reversed += toCheck[i];
        }

        if(toCheck === reversed){
            logger.info("String : " + sentence);
            logger.info("Is palindrome? Yes")
        }else{
            logger.info("String : " + sentence);
            logger.info("Is palindrome? No")
        }
    })
    .command('obfuscate','Obfuscate words')
    .argument('<words>','Insert the words here')
    .action(function(args,options,logger){
        let words = args.words;
        let result = '';
        
        for(let i = 0; i < words.length; i++){
            result += `&#${words.charCodeAt(i)};`; 
        }
        console.log(result);
    })
    .command('random','Generate random words')
    .option('--length <len>','Total character', prog.INT, 32)
    .option('--letters <trueOrFalse>','With letter or not', prog.BOOLEAN, true)
    .option('--numbers <trueOrFalse>','With number or not', prog.BOOLEAN, true)
    .option('--uppercase','Change to uppercase')
    .option('--lowercase','Change to lowercase')
    .action(function(args,options,logger){
        let char = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = '';

        if(options.letters == false){
            char = char.replace(/\D/g,'');
        }
        if(options.numbers == false){
            char = char.replace(/\d/g,'');
        }
        if(options.uppercase){
            char = char.toUpperCase();
        }
        if(options.lowercase){
            char = char.toLowerCase();
        }

        for( let i = options.length ; i > 0; i--){
            result += char[Math.floor(Math.random() * char.length)]
        }
        console.log(`The result ${result}`);
    })
    .command('ip','Get local ip address')
    .action(function(args,options,logger){

        let netIn = os.networkInterfaces().wlp3s0;
        let result = [];

        result = netIn.find(val => val.internal == false);

        console.log(result.address)
    })
    .command('ip-external','Get external ip address')
    .action(function(args,options,logger){
        axios.get('https://api.ipify.org/')
            .then(function(n){ 
                console.log(n.data)
            });
    })
    .command('headlines','Get headlines from kompas')
    .action(function(args,options,logger){
        let url = 'https://www.kompas.com/';

        axios.get(url)
            .then(function(n){
                let $ = cheerio.load(n.data);
                $('h2.headline__thumb__title').each((i,val) => {
                    const result = {
                        Title : $(val).text(),
                        URL : $(val).parent().attr('href')
                    }

                    logger.info(result);
                    
                });
                
            })
            .catch(function (error) {
                console.log(error);
            });
    })
    .command('convert','Convert csv to xls and coversely')
    .argument('<file1>','Insert origin file')
    .argument('<file2>','Insert new file name')
    .action(function(args,options,logger){
        const p1 = args.file1;
        const p2 = args.file2;
        const workbook = XLSX.readFile(p1);

        XLSX.writeFile(workbook,p2);
    })
    .command('screenshot','Take screenshot from a URL')
    .argument('<url>','Insert target url here')
    .option('--format <png/jpg/pdf>','Choose image format', ['png','jpg','pdf'], 'png')
    .option('--output <name>','Custom screenshot name')
    .action(function(args,options,logger){
        const testFolder = __dirname+'/image/';
        const fileName = 'screenshot';
        let number = 1;
        let extension = options.format;
        let completeFileName;


        if(!options.output){
            while(fs.existsSync(`${testFolder+fileName+'-'+number+'.'+extension}`)){
                number += 1;
            }
            completeFileName = fileName+'-'+number+'.'+extension;
        }else{
            
            if(fs.existsSync(`${testFolder+options.output}`)){
                let input = options.output;
                let customName = input.replace(/(\-\w+)|(\.\w+)/g,''); //adifferenttest
                let customExtension = input.replace(/.+(?=\.)\./g,''); //png
                let inBetween = 0;

                if(input.search("-") != -1){
                    inBetween = parseInt(input.replace(/.+(?=\-)\-|\.(?<=\.).+/g,''));
                }else{
                    inBetween = 1
                }
                //.+(?=\-)\- antara - dan .
                //\.(?<=\.).+ setelah dan

                while(fs.existsSync(`${testFolder+customName+'-'+inBetween+'.'+customExtension}`)){
                    inBetween += 1;
                }
                completeFileName = customName+'-'+inBetween+'.'+customExtension;
            }else{
                completeFileName = options.output;
            }
        }
        
        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            if(extension != 'pdf'){
                await page.goto(args.url);
                await page.screenshot({path: `image/${completeFileName}`});
            }else{
                await page.goto(args.url, {waitUntil: 'networkidle2'});
                await page.pdf({path: `image/${completeFileName}`, format: 'A4'});
            }
            
            await browser.close();
          })();
    })
    .command('screenshot-list')
    .argument('<file>','Txt file contain list')
    .option('--format <png/jpg>','Choose image format', ['png','jpg'], 'png')
    .action(function(args,options,logger){

        const byLine = readline.createInterface({
            input : fs.createReadStream(args.file),
            crlfDelay : Infinity
        });
        byLine.on('line',(line) => {
            screenshotList(line,options.format);
        });
    })
    .command('movies')
    .action((args,options,logger) => {
        let url = 'https://www.cgv.id/en/movies/now_playing';
        let movieList = [];

        function getMoviesList(){
            return new Promise((resolve,reject) => {
                axios.get(url)
                .then((n) => {
                    let $ = cheerio.load(n.data);
                     $('.movie-list-body ul li a').each((i,val) => {
                        let selector = 'https://www.cgv.id'+$(val).attr('href');
                        getMovieData(selector)
                    });
                    resolve();
                });
            })
        }
        
        function getMovieData(url){
            axios.get(url)
                .then((n) => {
                    let $ = cheerio.load(n.data);
                    $('.movie-info-wrapper').each((i,val) =>{
                        const result = {
                            title : $(val).find('.movie-info-title').text().trim(),
                            detail : $(val).find('.movie-add-info ul li').text().trim(),
                            synopsis : $(val).find('.movie-synopsis').text().trim()
                        }

                        logger.info(result);
                    })
                    
                })
        }

        (async () => {
            console.log(await getMoviesList())
            // console.log(movieList)
        })()
            
    })
prog.parse(process.argv);



function screenshotList(url,format){
        const testFolder = __dirname+'/image/';
        let fileName = url.replace(/\//g,"-");
        let number = 1;
        let extension = format;
        let completeFileName;

        while(fs.existsSync(`${testFolder+fileName+'-'+number+'.'+extension}`)){
            number += 1;
        }
        completeFileName = fileName+'-'+number+'.'+extension;
        
        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            if(extension != 'pdf'){
                await page.goto(url);
                await page.screenshot({path: `image/${completeFileName}`});
            }else{
                await page.goto(url, {waitUntil: 'networkidle2'});
                await page.pdf({path: `image/${completeFileName}`, format: 'A4'});
            }
            
            await browser.close();
        })();
}