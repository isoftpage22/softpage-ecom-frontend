import React from "react";
import { useField, useFormikContext } from "formik";
import 'date-fns';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { DatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns';

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';


export const DatePickerField = ({ ...props }) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(props);
  const [selectedDate, setSelectedDate] = React.useState(new Date('2014-08-18T21:11:54'));

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const useStyles = makeStyles((theme) => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      width: '100%',
      height:'auto',
    padding:'4px 8px 6px 0px',
    },
  }));

  const classes = useStyles();
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>

    <KeyboardDatePicker
  
   

      {...field}
      {...props}
      placeholder="dd/mm/yyyy"
      format="dd/MM/yyyy"
      className={props.className}
      disableFuture
      defaultValue="dd/MM/yyyy"
      InputProps={{ disableUnderline: true }}
      maxDate={moment().subtract(1,"days").toDate()}
      value={(field.value && new Date(field.value)) || null}
      onChange={val => {
        setFieldValue(field.name, val);
      }}
      InputLabelProps={{
        shrink: true,
      }}

      // scrollableMonthYearDropdown
    />
   </MuiPickersUtilsProvider>
  );
};

export default DatePickerField;
