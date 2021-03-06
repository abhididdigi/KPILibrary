/*
 *Written by diddigiabhi@gmail.com
 *A helper for KPI library -
 *
 */
var KPILibrary = Class.create();
KPILibrary.prototype = {
   initialize: function(tableName,span,unitOfMeasure) {
      this.tableName = 'incident'; //defaulting it to incident
      if(JSUtil.notNil(tableName)){
         this.tableName = tableName;
      }
      this.dur = 4;
      this.uom = unitOfMeasure;
      this.weeks = [];
      this.log = '';
   },
   
   /*
    *Function that returns the Open-Close weekly trend.
    *Input - Takes a paramter week, If nothing is passed, then defaults to current week, and gives the data corresponding to
    * the number of weeks back, passed in SPAN parameter in the Script Include intialization.
    *Return format: JSON - [{"open":[{"name":"value"},{},{}]},{"closed":[{},{},{},{}]}]
    * Weekly trend returns the number of Open and Closed tickets - for all the 4 weeks.
    * Week will start on Monday.But for Caluculation, Sundays will be considered too.
    * startWeek should be in yy-mm-dd format.
    */
   
   
   weeklyTrend:function(startWeek){
      try{
         var todaysDate;
         //If a start week is given
         if(JSUtil.notNil(startWeek)){
            //As of now nothing happens, this is a TODO for future.
            return;
         }else{
            //Get today's DateTime.
            todaysDate  = gs.nowDateTime();
         }
         //Construct the date and make its seconds 00:00:00
         var tdt = todaysDate.split(" ")[0];
         var ttt = '00:00:00';
         
         todaysDate = gs.dateGenerate(tdt,ttt);
         
         if(gs.isFirstDayOfWeek(todaysDate)){
            //If its first day of week, Go back 168 hours, 2*168 hours,3*168 hours and 4*168 hours
            var i =1;
            while(i<=this.dur){
               var hours = i*168;
               this.weeks.push(gs.hoursAgoStart(hours));
               i++;
            }
            
         }else{
            //First calculate the difference between today and the week's beggining.
            
            var begThisWeek = gs.beginningOfThisWeek();
            var diffInSec = gs.dateDiff(begThisWeek.toString() , todaysDate.toString(),true);
            var difference = diffInSec/3600;
            this.weeks.push(begThisWeek.toString());
            
            i =1;
            
            while(i<=this.dur-1){
               hours = (i*168)+difference*1;
               this.weeks.push(gs.hoursAgoStart(hours));
               i++;
               
            }
            
            
         }
         
         //Now iterate over the dates, and get the Opened on - create an array of objects.
         var fin = [];
         
         
         var c =0;
         var open = [];
         
         while(this.weeks[c]){
            var gr = new GlideRecord(this.tableName);
            gr.addQuery("opened_at",'>',this.weeks[c].split(" ")[0]+" 00:00:00");
            if(c!=0){
               var _c = c-1;
               gr.addQuery("opened_at",'<',this.weeks[_c].split(" ")[0]+" 00:00:00");
            }
            gr.query();
            
            var o = {};
            var dat = this.weeks[c];
            o[dat] = gr.getRowCount();
            open.push(o);
            c++;
         }
         var openObject = {};
         openObject['open'] = open;
         fin.push(openObject);
         
         //Now iterate over the dates, and get the closed on - create an array of objects.
         
         
         
         c =0;
         var close = [];
         
         while(this.weeks[c]){
            gr = new GlideRecord(this.tableName);
            gr.addQuery("closed_at",'>',this.weeks[c].split(" ")[0]+" 00:00:00");
            if(c!=0){
               var _c = c-1;
               gr.addQuery("closed_at",'<',this.weeks[_c].split(" ")[0]+" 00:00:00");}
               
               gr.query();
               var a = {};
               dat = this.weeks[c];
               a[dat] = gr.getRowCount();
               close.push(a);
               c++;
            }
            var closeObject = {};
            closeObject['closed'] = close;
            
            
            fin.push(closeObject);
            
            
            return fin;
            
            
         }catch(e){
            gs.log("Error in Script Include.Please check the code again"+ e);
            this.log = e;
            return;
         }
         
         
      },
      
      /*
       * This function returns trend between a particular field and its choices,
       * for example : priority and its choices(comma separated string) - Priority 1, 2, 3 or whatever ,needs to be passed.
       * Output will be a JSON array like this {"priority(fieldName)":[{"choice1":"numberoftickets"},"choice2":"numberoftickets2"} ] }
       *
       */
      
      
      fieldTrend:function(/*fieldname*/fieldName,/*choices/distributions of fieldName*/choices){
         
         var choiceArr = choices.split(',');
         var i=0;
         var arr = [];
         var finArr = {};
         while(choiceArr[i]){
            
            var o = {};
            var gr = new GlideRecord(this.tableName);
            gr.addQuery(fieldName,choiceArr[i]);
            gr.addActiveQuery();
            gr.query();
            
            var count =0;
            if(gr){
              
               count = gr.getRowCount();
            }
            var a = fieldName +"-"+ choiceArr[i];
         
            
            o['value'] = count;
           o['label'] = a;
            arr.push(o);
            i++;
         }
         finArr[fieldName] = arr;
         return finArr;
         
      },
      /*
       *
       * Ageing for records of any table. Thanks to http://community.servicenow.com/users/jimcoyne for the seed script.
       * Taken from here: http://community.servicenow.com/forum/10460
       * Input it takes the state - If left empty, Queries for all active records., Output will be a JSON:
       * [{"name":"value","name1":"value1","name2":"value2"}]
       */
      
      calculateAgeing:function(columnName,state){
         var finalArr = [];
         var age = {};
         age['0_2'] = 0;
         age['3_7'] = 0;
         age['8_14'] = 0;
         age['15_21'] = 0;
         age['22_28'] = 0;
         age['>28'] = 0;
         var elapsedTime = 0;
         var aging = '';
         var currentTimeNow = gs.nowDateTime();
         var gr = new GlideRecord(this.tableName);
         if(JSUtil.notNil(state) || JSUtil.notNil(columnName)) {
            gr.addQuery(columnName,state);
         }
         
         gr.addActiveQuery();
         
         gr.query();
         while(gr.next()) {
            elapsedTime = (gs.dateDiff(gr.opened_at, currentTimeNow, true)) /60/60/24;
            
            
            
            //check to see when the item was created
            if (elapsedTime <= 2) aging = age['0_2']= age['0_2']+1  ;
               if (elapsedTime > 2)  aging = age['3_7']= age['3_7']+1;
               if (elapsedTime > 7)  aging = age['8_14']= age['8_14']+1;
               if (elapsedTime > 14) aging = age['15_21']= age['15_21']+1 ;
               if (elapsedTime > 21) aging = age['22_28']= age['22_28']+1;
               if (elapsedTime > 28) aging = age['>28']= age['>28']+1;
               
            
            
         }
         
         finalArr.push(age);
         return finalArr;
         
      },
      
      
      
      
      
      
      
      
      type: 'KPILibrary'
   };