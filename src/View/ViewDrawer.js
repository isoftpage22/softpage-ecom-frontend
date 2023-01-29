import React, { useState } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Flex, Box, Spacer, Text, Stack, Radio, RadioGroup, CheckboxGroup, Checkbox,
} from "@chakra-ui/react"
import _ from "lodash";
import ProductCustomizationDrawer from '../Container/ProductCustomizationDrawer/ProductCustomizationDrawer'
const ViewDrawer = () => {
  const [value, setValue] = React.useState(1)
  const [checkBoxValue, setCheckBoxValue] = React.useState([3])
  const handleCheckBox = (Value) => {
    let SelectedValue = parseInt(Value)
    let dataInCheckBox = _.cloneDeep(checkBoxValue)
    if (dataInCheckBox.includes(SelectedValue)) {
      const index = dataInCheckBox.indexOf(SelectedValue)
      dataInCheckBox.splice(index, 1);
      setCheckBoxValue(dataInCheckBox)
    }
    else {
      dataInCheckBox.push(SelectedValue)
      setCheckBoxValue(dataInCheckBox)

    }
  }
  const data = [
    { id: 1, type: 'radio', name: 'Extra Cheese', customisationTag: 'SELECT ANY ONE' },
    { id: 2, type: 'radio', name: 'Extra Cheese', customisationTag: 'SELECT ANY ONE' },
    { id: 3, type: 'checkbox', name: 'Extra Cheese', customisationTag: 'SELECT EXTRAS' },
    { id: 4, type: 'checkbox', name: 'Extra Cheese', customisationTag: 'SELECT EXTRAS' },
    { id: 5, type: 'radio', name: 'Extra Cheese', customisationTag: 'SELECT ANY ONE' },
    { id: 6, type: 'radio', name: 'Extra Cheese', customisationTag: 'SELECT ANY ONE' },
    { id: 7, type: 'checkbox', name: 'Extra Cheese', customisationTag: 'SELECT ' },
    { id: 8, type: 'checkbox', name: 'Extra Cheese', customisationTag: 'SELECT ' },

  ]
  let groupData = _.groupBy(data, "customisationTag");
  return (
    <>
      <ProductCustomizationDrawer >
        {Object.keys(groupData).map((customisationTag, index) => {
          return (
            <Box>
              <Text my="25px" fontWeight="extrabold">{customisationTag}</Text>
              <RadioGroup value={value}>
                <Stack>
                  {groupData[customisationTag].map((data, index) => {
                    if (data.type == 'radio') {
                      return (
                        <Radio onChange={() => setValue(data.id)} isChecked={data.id == value ? true : false} value={data.id} colorScheme="green"><Text>{data.name}</Text> </Radio>
                      )
                    } else { return null }
                  })}
                </Stack>
              </RadioGroup>
              <CheckboxGroup colorScheme="green" value={checkBoxValue}>
                <Stack>
                  {groupData[customisationTag].map((data, index) => {
                    if (data.type == "checkbox") {
                      return (
                        <Checkbox isChecked={checkBoxValue.includes(data.id) ? true : false} onChange={(e) => handleCheckBox(e.target.value)} value={data.id}><Text>{data.name}</Text>
                        </Checkbox>
                      )
                    } else { return null }
                  })}
                </Stack>
              </CheckboxGroup>
            </Box>
          )
        })}
      </ProductCustomizationDrawer>
    </>
  )
}

export default ViewDrawer
