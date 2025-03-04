import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  Button,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {StyleSheet} from 'react-native';
import InfoPairs from '../ApprovalComponents/InfoPairs';
import ApprovalTableComponent from '../ApprovalComponents/ApprovalTableComponent';
import commonStyles from './../ApprovalCommonStyles';
import {TextInput} from 'react-native';
import {Checkbox} from 'react-native-paper';
import {Modal} from 'react-native';
import CustomModal from '../../common-utils/modal';
import TitleBar from '../../common-utils/TitleBar';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import {API_URL} from '../../ApiUrl';
import {DateFormatComma} from '../../common-utils/DateFormatComma';
import FetchValueAssignKeysAPI from '../ApprovalComponents/FetchValueAssignKeysAPI';
import FetchValueAssignKeysAPIDoubleArray from '../ApprovalComponents/FetchValueAssignKeysAPIDoubleArray';
import FetchValueAssignKeysAPIString from '../ApprovalComponents/FetchValueAssignKeysAPIString';
import ApproveRejectComponent from '../ApprovalComponents/ApproveRejectComponent';
import {sharedData} from '../../Login/UserId';
import {ReqBodyRejConv} from './BillsComp/ReqBodyRejConv';
import {ReqBodyConv} from './BillsComp/ReqBodyConv';
import CurrencyConversion from '../ApprovalComponents/FXRate';
import {NumToWordsCon} from '../ApprovalComponents/NumToWordsCon';
import {BlobFetchComponent} from '../../common-utils/BlobFetchComponent';
import DeviceInfo from 'react-native-device-info';
import {CustomThemeColors} from '../../CustomThemeColors';
import LoadingIndicator from '../../commonUtils/LoadingIndicator';
import KeyValueJoiner from '../ApprovalComponents/KeyValueJoiner';
import AdjustMinSlabFXRate from '../ApprovalComponents/AdjustMinSlabFXRate';
import {
  getUpdateCheckStatus,
  updateModRejectPayStatus,
} from './BillsComp/ReUseCancelComp';
import CustomModalWithCloseIcon from './../../common-utils/ModalWithCloseIcon';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../../common-utils/CustomButton';
import {wholedata} from '../ApprovalMainScreen';

const {width} = Dimensions.get('window');
const isMobile = width < 768;

// Karthic Nov 25
export const AdvancePayment = ({route}) => {
  // const {transName, transId, status, currentLevel, totalNoOfLevels} =
  //   route.params || {};
  const {transName, transId, status, currentLevel, totalNoOfLevels} =
    wholedata || {};
  const navigation = useNavigation();
  const [pairsData, setPairsData] = useState([]);
  const [accountNo, setAccountNo] = useState('');
  const [refNO, setRefNO] = useState('');
  const [mainData, setMainData] = useState([]);
  const [transDetails, setTransDetails] = useState([]);
  const [transValue, setTransValue] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [orderDetails, setOrderDetails] = useState('');
  const [materialAdPayment, setMaterialAdPayment] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState('');
  const [excludeTaxes, setExcludeTaxes] = useState('');
  const [slabTaxes, setSlabTaxes] = useState('');
  const [adjWithoutTax, setAdjWithoutTax] = useState('');
  const [noHeadRemarksblw, setNoHeadRemarksblw] = useState('');
  const [supplierBankMain, setSupplierBankMain] = useState([]);

  const [approvalParams, setApprovalParams] = useState([]);
  const [rejParams, setRejParams] = useState([]);
  const [appRejParams, setAppRejParams] = useState([]);
  const [fxRate, setFxRate] = useState('');
  const [currency, setCurrency] = useState('');
  const [numToWords, setNumToWords] = useState('');
  const [actualMinSlab, setActualMinSlab] = useState('');
  const [actualPaidAftAdj, setActualPaidAftAdj] = useState('');
  const [PDFModalVisible, setPDFModalVisible] = useState(false);
  const [calculatedTDS, setCalculatedTDS] = useState('');
  const [tDSCurrency, setTDSCurrency] = useState('');
  const [slabFXRate, setSlabFXRate] = useState('');
  const [actualSlabMain, setActualSlabMain] = useState('');
  const [reUseCancel, setReUseCancel] = useState('');
  const [appRejUrl, setAppRejUrl] = useState('');

  const [checkStatus, setCheckStatus] = useState([]);
  const [action, setAction] = useState(null);
  const totalPayableAmtRef = useRef(0);

  useEffect(() => {
    console.log('isLoading:::', isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log('checkStatus:::', checkStatus);
  }, [checkStatus]);

  useEffect(() => {
    'supplierBankMain::' + supplierBankMain;
  }, [supplierBankMain]);

  useEffect(() => {
    console.log('additionalCharges:::', additionalCharges);
    for (let i = 0; additionalCharges.length > i; i++) {
      if (additionalCharges) {
        const total =
          parseFloat(additionalCharges[i]['Remaining Balance']) +
          parseFloat(additionalCharges[i]['Advance Amount']) +
          parseFloat(additionalCharges[i]['Advance Paid']) +
          parseFloat(additionalCharges[i]['TDS Amount']);
        console.log('totaladditionalCharges:::', Math.round(total));
        additionalCharges[i][`Total Amount(${currency})`] = total.toFixed(2);
      }
    }
  }, [additionalCharges]);

  useEffect(() => {
    console.log('materialAdPayment:::', materialAdPayment);
    for (let i = 0; materialAdPayment.length > i; i++) {
      if (materialAdPayment) {
        const total =
          parseFloat(materialAdPayment[i]['Remaining Balance']) +
          parseFloat(materialAdPayment[i]['Advance Amt']) +
          parseFloat(materialAdPayment[i]['Advance Paid']) +
          parseFloat(materialAdPayment[i]['TDS Amount']);
        console.log('totalmaterialAdPayment:::', Math.round(total));
        materialAdPayment[i][`Total Amount(${currency})`] =
          parseFloat(total).toFixed(2);
      }
    }
  }, [materialAdPayment]);

  useEffect(() => {
    console.log('orderDetails:::', orderDetails);
    // Function to calculate totalPayableAmt
    // const calculateTotalPayableAmt = () => {
    // totalPayableAmtRef.current = (
    //   Array.isArray(orderDetails) ? orderDetails : []
    // ).reduce((sum, order) => sum + parseFloat(order['Payable Amt'] || '0'), 0);
    totalPayableAmtRef.current = (
      Array.isArray(orderDetails) ? orderDetails : []
    )
      .filter(order => parseFloat(order['Payable Amt']) > 0) // Filter only positive amounts
      .reduce((sum, order) => sum + parseFloat(order['Payable Amt'] || '0'), 0);
    // };
  }, [orderDetails]);

  useEffect(() => {
    console.log('mainData::', mainData);
  }, [mainData]);

  useEffect(() => {
    console.log('approvalParams::', approvalParams);
  }, [approvalParams]);

  useEffect(() => {
    console.log('adjWithoutTax::', adjWithoutTax);
    let totalTaxAmount = 0;
    let actual = 0;
    for (let i = 0; orderDetails.length > i; i++) {
      actual += parseFloat(orderDetails[i]['Advance Amount']);
    }
    console.log('actualAmt::', actual);
    setActualMinSlab(actual);
    if (slabTaxes) {
      if (slabTaxes[0]['ST Paid']) {
        const totalAmount = slabTaxes
          .map(item => parseFloat(item['ST Paid'])) // Convert Tax Amount to a number
          .reduce((sum, amount) => sum + amount, 0); // Sum all Tax Amounts
        totalTaxAmount =
          parseFloat(actual) - parseFloat(totalAmount) * parseFloat(slabFXRate);
        console.log('Total Tax Amount:', actual);
      } else {
        totalTaxAmount = actual;
      }
    }
    // setActualMinSlab(totalTaxAmount*slabFXRate)
    if (adjWithoutTax.length > 0) {
      const totalAmount = adjWithoutTax.reduce((total, adjustment) => {
        const amount = Number(adjustment.Amount || 0); // Ensure Amount is a number
        return adjustment['Adjustment Type'] === 'Less'
          ? total - amount
          : total + amount;
      }, 0);

      // const actualSlab = slabFXRate; // Assuming actualMinSlab is defined

      console.log('adjustments::', totalTaxAmount);
      console.log('actualSlab::', slabFXRate);
      // if(actualMinSlab === totalTaxAmount){
      // setActualMinSlab(totalTaxAmount);}
      setActualSlabMain(totalTaxAmount);

      setActualPaidAftAdj(parseFloat(totalTaxAmount) + parseFloat(totalAmount));
    } // Start with an initial total of 0
  }, [adjWithoutTax, slabFXRate, slabTaxes, actualMinSlab, orderDetails]);

  // Using async functions inside useEffect
  useEffect(() => {
    setIsLoading(true);

    console.log('transValue::', transValue);
    const body = ReqBodyConv(
      {transobj: transValue},
      transId,
      currentLevel,
      transName,
      'Advance Payment',
    );
    const rejBody = ReqBodyRejConv(
      transValue,
      transId,
      currentLevel,
      transName,
      // "Advance Payment"
    );
    const bodyStringified = JSON.stringify(body._j);
    const bodyRejStringified = JSON.stringify(rejBody);
    console.log('rejBodyJson::', JSON.stringify(rejBody));
    console.log('rejBody::', rejBody);
    console.log('ApproveBody::', bodyStringified);
    setRejParams(bodyRejStringified);
    setApprovalParams(bodyStringified);
    console.log('body req::', bodyStringified); // Log immediately before updating the state
    setIsLoading(false);
  }, [transValue]);

  useEffect(() => {
    setIsLoading(true);

    if (tDSCurrency.length > 0) {
      console.log('currency tds::', tDSCurrency); // Logs the first element of the array
      fetchAdvancePaymentDetails();
    } else {
      console.log('currency tds:: No currency available');
      getTaxCurrency();
    }
    setIsLoading(false);
  }, [tDSCurrency]);

  const getTaxCurrency = async () => {
    try {
      // SQL query to get the TAX_CURRENCY
      const taxCurrencyQuery = `select TAX_CURRENCY from financial_cycle where rownum = 1`;

      const response = await fetch(
        `${API_URL}/api/common/loadContents?sql=${encodeURIComponent(
          taxCurrencyQuery,
        )}`,
      );
      const taxCurrencyResult = await response.json();
      console.log('Tax Currency Result adv page:', taxCurrencyResult);

      if (taxCurrencyResult.length > 0) {
        if (Array.isArray(taxCurrencyResult) && taxCurrencyResult.length > 0) {
          setTDSCurrency(taxCurrencyResult[0]); // Sets only the first element
        } else {
          setTDSCurrency(''); // Fallback in case the array is empty or not valid
        }
      } else {
        console.error('Tax currency not found.');
      }
    } catch (error) {
      console.error('Error fetching tax currency:', error);
    }
  };
  useEffect(() => {
    setIsLoading(true);
    getTaxCurrency();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    console.log('excludeTaxes::', excludeTaxes);
    const totalTdsAmount = (excludeTaxes || []).reduce((sum, item) => {
      return item['Apply TDS'] === true
        ? sum + Number(item['TDS Amount'] || 0)
        : sum;
    }, 0);

    console.log('totalTdsAmount:', totalTdsAmount * fxRate);
    const tds = totalTdsAmount * fxRate;
    setCalculatedTDS(tds);
    // const totalTdsAmount = 5

    console.log('calculatedTDS:', calculatedTDS);
    setIsLoading(false);
  }, [excludeTaxes, fxRate]);

  useEffect(() => {
    setIsLoading(true);
    console.log('transValue::', transValue);
    if (transValue.length !== 0) {
      // Fetch Order Details

      const headArrTb1 =
        transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [
              'P Order No',
              'Supplier Name',
              'PO Qty',
              'Discount %',
              'Discount(PO)',
              `Discount(${currency})`,
              'Total Amount(PO)',
              `Total Amount(${currency})`,
              'Payable Amt',
              'Advance Amount',
              'Advance Paid',
              'TDS Amount',
              'Remaining Balance',
              'PO Currency',
            ]
          : transValue[4][0]?.ORDER_TYPE === 'JO'
          ? [
              'JO No',
              'Supplier Name',
              'JO Qty',
              'Discount %',
              'Discount(JO)',
              `Discount(${currency})`,
              'Total Amount(JO)',
              `Total Amount(${currency})`,
              'Payable Amt',
              'Advance Amount',
              'Advance Paid',
              'TDS Amount',
              'Remaining Balance',
              'JO Currency',
            ]
          : [
              'SO No',
              'Party Name',
              'SO Qty',
              'Discount %',
              'Discount(SO)',
              `Discount(${currency})`,
              'Total Amount(SO)',
              `Total Amount(${currency})`,
              'Payable Amt',
              'Advance Amount',
              'Advance Paid',
              'TDS Amount',
              'Remaining Balance',
              'SO Currency',
            ];
      const otherDltsExclude =
        transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [0, 7, 10, 11, 16]
          : [6, 9, 10, 15];
      // Extract the PO_SO_JO_NO values
      const poSoJoNos = transValue[4].map(item => item.PO_SO_JO_NO);

      // Remove duplicates if needed
      const uniquePoSoJoNos = [...new Set(poSoJoNos)];
      console.log('OtherDetails params::', {
        payment_id: paymentId,
        type: transValue[4][0].ORDER_TYPE,
        orders: uniquePoSoJoNos,
        datafor: 'Approval',
      });
      FetchValueAssignKeysAPIString(
        `${API_URL}/api/approval/payment/getAdvPayOrderMain`,
        headArrTb1,
        otherDltsExclude,
        setOrderDetails,
        {
          payment_id: paymentId,
          type: transValue[4][0].ORDER_TYPE,
          orders: uniquePoSoJoNos,
          datafor: 'Approval',
        },
        'POST',
      );

      // Materials for Advance Payment
      const headArr =
        transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [
              'P Order No',
              'Supplier Name',
              'Mat No',
              'Color',
              'Size',
              'Ref No',
              'Type',
              'Material Specification',
              'Qty',
              'UOM',
              'Price/UOM',
              'Discount %',
              'Discount(PO)',
              `Discount(${currency})`,
              'Total Amount (PO)',
              `Total Amount(${currency})`,
              'Payable Amt',
              'Advance Amt',
              'Advance Paid',
              'TDS Amount',
              'Remaining Balance',
              'Currency',
            ]
          : transValue[4][0]?.ORDER_TYPE === 'JO'
          ? [
              'JO No',
              'Unit Name',
              'Job Id',
              'Work Center',
              'Process',
              'Item No',
              'Mat No',
              'Material Specification',
              'Qty',
              'UOM',
              'Rate',
              'Discount %',
              'Discount(JO)',
              `Discount(${currency})`,
              'Total Amount (JO)',
              `Total Amount(${currency})`,
              'Payable Amt',
              'Advance Amt',
              'Advance Paid',
              'TDS Amount',
              'Remaining Balance',
              'Currency',
            ]
          : [
              'SO No',
              'Service Provider',
              'Service Id',
              'Service Type',
              'SO Description',
              'Additional Details',
              'Qty',
              'Rate',
              'Discount %',
              'Discount(SO)',
              `Discount(${currency})`,

              'Total Amount (SO)',
              `Total Amount(${currency})`,
              'Payable Amt',
              'Advance Amt',
              'Advance Paid',
              'TDS Amount',
              'Remaining Balance',
              'Currency',
            ];
      const matAdExc =
        transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [0, 16, 18, 22, 24, 26]
          : transValue[4][0]?.ORDER_TYPE === 'JO'
          ? [15, 17, 21, 23, 25]
          : [13, 14, 18, 20, 22];

      FetchValueAssignKeysAPIString(
        `${API_URL}/api/approval/payment/getAdvPayOrderDetails`,
        headArr,
        matAdExc,
        setMaterialAdPayment,
        {
          payment_id: paymentId,
          type: transValue[4][0].ORDER_TYPE,
          orders: uniquePoSoJoNos,
          datafor: 'Approval',
        },
        'POST',
      );

      const chargeArr =
        transValue[4][0]?.ORDER_TYPE === 'JO'
          ? [
              'JO No',
              'Job Id',
              'Item No',
              'Mat No',
              'SID',
              'Service/Material Category',
              'Service/Material Type',
              'UOM',
              'Expense Type',
              'Description',
              'Qty',
              'Rate',
              'Amount',
              `Total Amount(${currency})`,
              'Payable Amount',
              'Advance Amount',
              'Advance Paid',
              'TDS Amount',
              'Remaining Balance',
              'Currency',
              'Select',
            ]
          : transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [
              'P Order No',
              'Mat No',
              'SID',
              'Service/Material Category',
              'Service/Material Type',
              'Uom',
              'Expense Type',
              'Description',
              'Qty',
              'Rate',
              'Amount',
              `Total Amount(${currency})`,
              'Payable Amount',
              'Advance Amount',
              'Advance Paid',
              'TDS Amount',
              'Remaining Balance',
              'Currency',
              'Select',
            ]
          : [
              'SO No',
              'Service Id',
              'SID',
              'Service/Material Category',
              'Service/Material Type',
              'Uom',
              'Expense Type',
              'Description',
              'Qty',
              'Rate',
              'Amount',
              `Total Amount(${currency})`,
              'Payable Amount',
              'Advance Amount',
              'Advance Paid',
              'TDS Amount',
              'Remaining Balance',
              'Currency',
              'Select',
            ];
      const adChargeExc =
        transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [0, 12, 14, 18, 20, 22]
          : transValue[4][0]?.ORDER_TYPE === 'JO'
          ? [13, 14, 19, 22, 23]
          : [11, 13, 17, 20, 21];
      // Additional Charges (Taxable)
      FetchValueAssignKeysAPIString(
        `${API_URL}/api/approval/payment/getAdvPayChargesDetails`,
        chargeArr,
        adChargeExc,
        setAdditionalCharges,
        {
          payment_id: paymentId,
          type: transValue[4][0].ORDER_TYPE,
          orders: uniquePoSoJoNos,
          datafor: 'Approval',
        },
        'POST',
      );

      // Selected Taxes to Exclude
      // await

      const excludeArr =
        transValue[4][0]?.ORDER_TYPE === 'JO'
          ? [
              'JO No',
              'Tax Name',
              'Rate',
              'Tax Amount',
              'TDS Amount',
              'Previous Deduction Amt',
              'Remaining Tax Amt',
              'Inclusive Tax',
              'Apply TDS',
            ]
          : transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [
              'P Order No',
              'Tax Name',
              'Rate',
              'Tax Amount',
              'TDS Amount',
              'Previous Deduction Amt',
              'Remaining Tax Amt',
              'Inclusive Tax',
              'Apply TDS',
            ]
          : [
              'SO No',
              'Tax Name',
              'Rate',
              'Tax Amount',
              'TDS Amount',
              'Previous Deduction Amt',
              'Remaining Tax Amt',
              'Inclusive Tax',
              'Apply TDS',
            ];
      const excExclude =
        transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [0, 3, 9, 10, 11]
          : [2, 8, 9, 10];
      FetchValueAssignKeysAPIDoubleArray(
        `${API_URL}/api/approval/payment/getOrderTaxProfileAdvPay`,
        excludeArr,
        excExclude,
        setExcludeTaxes,
        {
          payment_id: paymentId,
          type: transValue[4][0].ORDER_TYPE,
          orders: uniquePoSoJoNos,
          datafor: 'Approval',
        },
        'POST',
      );
      console.log('selected supplier');
      FetchValueAssignKeysAPI(
        `${API_URL}/api/common/finLoadVectorwithContentsjson`,
        [
          'Bank A/C No',
          'Party Name',
          'Account Holder Name',
          'Bank Name',
          'Branch Name',
          'Country',
          'Currency',
          'Swift No',
        ],
        [],
        setSupplierBankMain,
        {
          query: `select bad.account_no,bad.party_name, bad.account_holder_name,coalesce( bm.bank_name,'-') as bank_name,coalesce( bm.branch_name,'-') as branch_name, coalesce(bm.country,'-') as country, bad.currency, bm.swift_code from bank_account_details bad left join  bank_master bm on bm.bank_id = bad.bank_id where (bad.account_no||':::'||bad.bank_id||':::'||bad.party_name='${transValue[3]?.['PARTY_ACCOUNT_NO']}' or bad.account_no='${transValue[3]?.['PARTY_ACCOUNT_NO']}' ) and bad.account_category='Party' `,
        },
        'POST',
      );

      // Slab Tax
      // FetchValueAssignKeysAPIString(
      //   ``,
      //   [
      //     'Party Name',
      //     'Party Type',
      //     'Dept Name',
      //     'Tax Name',
      //     'Rate',
      //     'Tax Amount',
      //     'Already Paid',
      //     'Slab',
      //     'Bill Amount',
      //     'ST Paid',
      //     'Applied ST',
      //   ],
      //   [],
      //   setSlabTaxes,
      //   {
      //     payment_id: paymentId,
      //     type: transValue[4][0].ORDER_TYPE,
      //     orders: [transValue[4][0].PO_SO_JO_NO],
      //     datafor: 'Approval',
      //   },
      //   'POST',
      // );

      //Applicable Slab Taxes
      const keys = [
        'Party Name',
        'Party Type',
        'Dept Name',
        'Tax Name',
        'Rate',
        'Tax Amount',
        'Already Paid',
        'Slab',
        'Bill Amount',
        'ST Paid',
        'Applied ST',
      ];

      // Call the KeyValueJoiner function
      // const filteredPairs = KeyValueJoiner(keys, transValue[9], [0]);
      KeyValueJoiner(keys, transValue[9], [0], setSlabTaxes);

      // console.log('filteredPairs', transValue[9]);
      // console.log('filteredPairs', filteredPairs);
      // setSlabTaxes(filteredPairs);

      // Other changes & Adjustments (Without Tax)
      const otherTaxArr =
        transValue[4][0]?.ORDER_TYPE === 'JO'
          ? [
              'JO No',
              'Adjustment ID',
              'Adjustment Name',
              'Adjustment Type',
              'Description',
              'Amount',
              'Remarks',
            ]
          : transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [
              'P Order No',
              'Adjustment ID',
              'Adjustment Name',
              'Adjustment Type',
              'Description',
              'Amount',
              'Remarks',
            ]
          : [
              'SO No',
              'Adjustment ID',
              'Adjustment Name',
              'Adjustment Type',
              'Description',
              'Amount',
              'Remarks',
            ];
      const outExclude =
        transValue[4][0]?.ORDER_TYPE === 'PO'
          ? [0, 3, 4]
          : transValue[4][0]?.ORDER_TYPE === 'JO'
          ? [1, 4, 3]
          : [2, 3];

      FetchValueAssignKeysAPIString(
        `${API_URL}/api/approval/payment/getAdvPayAdjustmentsDetails`,
        otherTaxArr,
        outExclude,
        setAdjWithoutTax,
        {
          payment_id: paymentId,
          type: transValue[4][0].ORDER_TYPE,
          orders: uniquePoSoJoNos,
          datafor: 'Approval',
        },
        'POST',
      );

      FetchValueAssignKeysAPI(
        `${API_URL}/api/approval/payment/getBillsBankDetailsadv`,
        [
          'Bank A/c No',
          'Account Holder Name',
          'Account Type',
          'Bank Name',
          'State',
          'Country',
          'Available Balance',
          'Effective Balance',
          'Minimum Balance',
          'Currency',
        ],
        [],
        setNoHeadRemarksblw,
        {
          accountNo: mainData[8],
        },
      );
      console.log(
        'setSupplierBankMain::' +
          JSON.stringify({
            payment_id: paymentId,
            type: transValue[4][0].ORDER_TYPE,
            orders: uniquePoSoJoNos,
            datafor: 'Approval',
          }),
      );
    }
    // const chkSts = getUpdateCheckStatus(
    //   transName,
    //   paymentId,
    //   mainData[8],
    //   transDetails[3],
    //   mainData[7],
    //   currentLevel,
    // );
    // setCheckStatus(chkSts);
    setIsLoading(false);
  }, [paymentId]);

  useEffect(() => {
    const fetchCheckStatus = async () => {
      if (
        paymentId !== null &&
        mainData.length > 0 &&
        transDetails.length > 0
      ) {
        try {
          const chkSts = await getUpdateCheckStatus(
            transName,
            paymentId,
            mainData[8],
            transDetails[3],
            mainData[7],
            currentLevel,
            wholedata.noOfLevel,
            action, // Approve/Reject
          );

          console.log('checkStatuscheckStatus::', JSON.stringify(chkSts));

          setCheckStatus(chkSts); // Set resolved data in state
        } catch (error) {
          console.error('Error fetching check status:', error);
        }
      }
    };

    fetchCheckStatus(); // Call the async function
  }, [paymentId, mainData, transDetails, action]);

  useEffect(() => {
    console.log('pairsData::', pairsData);
  }, [pairsData]);

  // Function to toggle modal visibility

  const tableData = [
    {
      lastMessage: 'Hello',
      lastMessageSentBy: 'admin',
      newMessagesCount: 0,
      userName: 'admifn',
      lastMegssage: 'Hellgo',
      lastMesfsageSentBy: 'adfmin',
      newMesfsagesCount: 0,
      usefrName: 'admin',
      lastMefssage: 'Hello',
      lastMessagefSentBy: 'admin',
      newMessafgesCount: 0,
      userNgame: 'admin',
    },
  ];
  const [showInfoPairs, setShowInfoPairs] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const handleButtonClick = () => {
    setShowInfoPairs(!showInfoPairs); // Toggle visibility
  };

  //   ------------------ API Requests --------------------- //Karthic Nov 26

  const fetchAdvancePaymentDetails = async () => {
    try {
      setIsRefreshing(true);
      setIsLoading(true);
      const credentials = await Keychain.getGenericPassword({service: 'jwt'});
      const token = credentials.password;

      const response = await axios.get(
        `${API_URL}/api/approval/payment/getApprovalDetails`,
        {
          params: {
            trans_id: transId,
            user_id: sharedData.userName,
            status: 'initiated',
            trans_name: transName,
          },
          headers: {
            'Content-Type': 'application/json',
            //   Authorization: `${token}`,
          },
        },
      );

      const approvalDetailsRaw = response.data?.Approval_Details;
      if (approvalDetailsRaw) {
        const approvalDetails = JSON.parse(approvalDetailsRaw);
        const {transobj} = approvalDetails;

        if (typeof transobj === 'string') {
          const parsedTransObj = JSON.parse(transobj);

          const processData = data => {
            if (Array.isArray(data)) {
              return data.map(item => item);
            } else if (typeof data === 'object') {
              return Object.keys(data).map(key => data[key]);
            }
            return [];
          };

          const Main = processData(parsedTransObj[1]);
          const transactionDetails = processData(parsedTransObj[3]);
          const poDetails = processData(parsedTransObj[2][0]);

          console.log('Final Main::', Main);
          console.log('Final transactionDetails:', transactionDetails);
          console.log('Final poDetails:', poDetails);
          console.log('Final parsedTransObj:', parsedTransObj);

          setCurrency(parsedTransObj[1].PARTY_CURRENCY);

          setMainData(Main);
          setTransDetails(transactionDetails);
          setTransValue(parsedTransObj);

          setPaymentId(Main[0]);
          setAccountNo(Main[8]);

          const Type = parsedTransObj[4][0]?.ORDER_TYPE;

          const formattedData = {
            'Payment date': DateFormatComma(Main[1]),
            [`Payment Amount (${parsedTransObj[1].PARTY_CURRENCY})`]:
              poDetails[3],
            [`TDS Amount (${tDSCurrency})`]: 0,
            [`Actual Amount-Slab Tax Amount (${parsedTransObj[1].PARTY_CURRENCY})`]:
              poDetails[2].toFixed(4),
            'Actual Paid After Adjustment': Main[6].toFixed(4),
            [`${
              Main[7].toLowerCase() === 'RTGS/NEFT'.toLowerCase()
                ? 'RTGS/NEFT Ref '
                : Main[7].toLowerCase() === 'Bank Transfer'.toLowerCase()
                ? 'TT '
                : Main[7].toLowerCase() === 'Demand Draft'.toLowerCase()
                ? 'DD '
                : Main[7].toLowerCase() === 'MOBILE BANKING'.toLowerCase()
                ? 'MB Ref '
                : Main[7].toLowerCase() === 'Debit Card'.toLowerCase()
                ? 'DC '
                : Main[7].toLowerCase() === 'Credit Card'.toLowerCase()
                ? 'CC '
                : Main[7].toLowerCase() === 'Cheque'.toLowerCase()
                ? 'Cheque '
                : Main[7].toLowerCase() === 'Letter Of Credit'.toLowerCase()
                ? 'LL '
                : Main[7].toLowerCase() === 'NET BANKING'.toLowerCase()
                ? 'NB Ref'
                : Main[7].toLowerCase() === 'G_PAY'.toLowerCase()
                ? 'GP '
                : 'Ref '
            }No`]: transactionDetails[3],
            [['Demand Draft', 'Debit Card', 'Cheque'].includes(Main[7])
              ? 'Favour of'
              : 'Party Name']: transactionDetails[5],
            [`${
              Main[7].toLowerCase() === 'RTGS/NEFT'.toLowerCase()
                ? 'RTGS/NEFT '
                : Main[7].toLowerCase() === 'Bank Transfer'.toLowerCase()
                ? 'TT '
                : Main[7].toLowerCase() === 'Demand Draft'.toLowerCase()
                ? 'DD '
                : Main[7].toLowerCase() === 'MOBILE BANKING'.toLowerCase()
                ? 'MB '
                : Main[7].toLowerCase() === 'Debit Card'.toLowerCase()
                ? 'DC '
                : Main[7].toLowerCase() === 'Credit Card'.toLowerCase()
                ? 'CC '
                : Main[7].toLowerCase() === 'Cheque'.toLowerCase()
                ? 'Cheque '
                : Main[7].toLowerCase() === 'Letter Of Credit'.toLowerCase()
                ? 'LL '
                : Main[7].toLowerCase() === 'NET BANKING'.toLowerCase()
                ? 'NB '
                : Main[7].toLowerCase() === 'G_PAY'.toLowerCase()
                ? 'GP '
                : 'Cash '
            } Date`]: DateFormatComma(Main[1]),
            [`${
              Main[7].toLowerCase() === 'RTGS/NEFT'.toLowerCase()
                ? 'RTGS/NEFT '
                : Main[7].toLowerCase() === 'Bank Transfer'.toLowerCase()
                ? 'TT '
                : Main[7].toLowerCase() === 'Demand Draft'.toLowerCase()
                ? 'DD '
                : Main[7].toLowerCase() === 'MOBILE BANKING'.toLowerCase()
                ? 'MB '
                : Main[7].toLowerCase() === 'Debit Card'.toLowerCase()
                ? 'DC '
                : Main[7].toLowerCase() === 'Credit Card'.toLowerCase()
                ? 'CC '
                : Main[7].toLowerCase() === 'Cheque'.toLowerCase()
                ? 'Cheque '
                : Main[7].toLowerCase() === 'Letter Of Credit'.toLowerCase()
                ? 'LL '
                : Main[7].toLowerCase() === 'NET BANKING'.toLowerCase()
                ? ' '
                : Main[7].toLowerCase() === 'G_PAY'.toLowerCase()
                ? 'GP '
                : 'Cash '
            } Amt (${Main[9]})`]: Main[6],
            ...(transName === 'CancelPayment' && {
              Reason: parsedTransObj[1]?.['INSTRUCTIONS'],
            }),
          };
          const numResult = await NumToWordsCon(Main[6], Main[9]);
          setNumToWords(numResult);
          setActualMinSlab(
            formattedData[
              `Actual Amount-Slab Tax Amount (${parsedTransObj[1].PARTY_CURRENCY})`
            ],
          );
          console.log('slabMinActual::', Main);
          console.log(
            'slabMinActual::',
            formattedData[
              `Actual Amount-Slab Tax Amount (${parsedTransObj[1].PARTY_CURRENCY})`
            ],
          );
          setPairsData([formattedData]);
        }
      }
    } catch (error) {
      console.error('Error fetching approval details:', error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const toggleModalPDF = () => {
    setPDFModalVisible(!PDFModalVisible);
  };
  const toggleModalReUse = () => {
    setReUseCancel(!reUseCancel);
  };

  return (
    <View
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={fetchAdvancePaymentDetails} // Trigger fetchData on pull-down
          colors={[CustomThemeColors.primary]} // Customize spinner color
        />
      }>
      <TitleBar
        text={`${
          transName === 'ModPayment' ? 'Modify Advance Payment' : transName
        } - ${paymentId}`}
        showMenuBar={true}
        onMenuPress={() => navigation.openDrawer()}
        showCloseIcon={true}
        onClose={() => navigation.navigate('ApprovalMainScreen')}
        showFileIcon={true}
        onFilePress={() => setPDFModalVisible(!PDFModalVisible)}
      />
      <CurrencyConversion
        BillCurrency={currency}
        setFxRate={setFxRate}
        // setTDSCurrency={setTDSCurrency}
      />
      <AdjustMinSlabFXRate
        FromCurrency={tDSCurrency}
        ToCurrency={currency}
        setFxRate={setSlabFXRate}
      />
      {/* Show InfoPairs or TableComponent based on the state */}
      {showInfoPairs ? (
        <>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={fetchAdvancePaymentDetails} // Trigger fetchData on pull-down
                colors={[CustomThemeColors.primary]} // Customize spinner color
              />
            }>
            <InfoPairs
              data={pairsData}
              imp={[
                'Cheque No',
                'LC Ref No',
                'Favour of',
                'DD No',
                'RTGS/NEFT Ref No',
                'TT No',
                'MB Ref No',
                'DC No',
                'CC No',
                'NB Ref No',
                'GP No',
                'LL No',
                'Party Name',
                'Reason',
              ]}
              valueChanger={{
                [`Payment Amount (${transValue[1]?.PARTY_CURRENCY})`]:
                  totalPayableAmtRef.current.toFixed(2),
                [`TDS Amount (${tDSCurrency})`]:
                  parseFloat(calculatedTDS).toFixed(4),
                [`Actual Paid After Adjustment`]:
                  parseFloat(actualPaidAftAdj).toFixed(4),
                [`Actual Amount-Slab Tax Amount (${transValue[1]?.PARTY_CURRENCY})`]:
                  parseFloat(actualSlabMain).toFixed(4),
                'Party Name': orderDetails[0]?.['Supplier Name']
                  ? orderDetails[0]['Supplier Name']
                  : 0,
              }}
            />
          </ScrollView>
          {isLoading ? <LoadingIndicator message="Please wait..." /> : <></>}
        </>
      ) : (
        <>
          {isLoading ? <LoadingIndicator message="Please wait..." /> : <></>}

          <ScrollView
            style={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={fetchAdvancePaymentDetails} // Trigger fetchData on pull-down
                colors={[CustomThemeColors.primary]} // Customize spinner color
              />
            }>
            <View style={commonStyles.flexRow}>
              <Text style={commonStyles.oneLineKey}>Payment Date</Text>
              <Text style={commonStyles.oneLineValue}>
                {DateFormatComma(mainData[1])}
              </Text>
            </View>
            {orderDetails && (
              <ApprovalTableComponent
                tableData={orderDetails}
                highlightVal={['Payable Amt']}
                heading={'Order Details'}
              />
            )}
            {materialAdPayment && (
              <ApprovalTableComponent
                tableData={materialAdPayment}
                highlightVal={['Payable Amt']}
                heading={
                  transValue[4][0]?.ORDER_TYPE === 'JO'
                    ? 'Jobs for Advance Payment'
                    : transValue[4][0]?.ORDER_TYPE === 'PO'
                    ? 'Materials for Advance Payment'
                    : 'Service for Advance Payment'
                }
              />
            )}
            {additionalCharges && (
              <ApprovalTableComponent
                tableData={additionalCharges}
                highlightVal={['']}
                heading={'Additional Charges (Taxable)'}
              />
            )}
            {excludeTaxes && (
              <ApprovalTableComponent
                tableData={excludeTaxes}
                highlightVal={['']}
                heading={'Select Taxes to Exclude'}
              />
            )}
            {slabTaxes && (
              <ApprovalTableComponent
                tableData={slabTaxes}
                highlightVal={['']}
                heading={`Applicable Slab Taxes (${tDSCurrency} Currency)`}
              />
            )}
            {adjWithoutTax && (
              <ApprovalTableComponent
                tableData={adjWithoutTax}
                highlightVal={['Amount', 'Remarks']}
                heading={'Other charges & Adjustments(Without Tax)'}
              />
            )}
            <View style={commonStyles.disableButtonTextContainer}>
              <Text style={commonStyles.disableButtonText}>Slab History</Text>
            </View>
            <View style={commonStyles.flexColumn}>
              <Text style={commonStyles.oneLineKey}>
                TDS Amount({tDSCurrency})
              </Text>
              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={parseFloat(calculatedTDS).toFixed(4)}
                editable={false} // Disables input
              />
            </View>
            <View style={commonStyles.flexColumn}>
              <Text style={commonStyles.oneLineKey}>
                Actual Amount - Slab Tax Amount ({transValue[1].PARTY_CURRENCY})
              </Text>
              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={parseFloat(actualSlabMain).toFixed(4)}
                editable={false} // Disables input
              />
            </View>
            <View style={commonStyles.flexColumn}>
              <Text style={commonStyles.oneLineKey}>
                Actual Paid after adjustment
              </Text>

              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={parseFloat(actualPaidAftAdj).toFixed(4)}
                editable={false} // Disables input
              />
            </View>
            <View style={commonStyles.flexRow}>
              <Text style={commonStyles.oneLineKey}>Payment Mode</Text>
              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={mainData[7]}
                editable={false} // Disables input
              />
            </View>
            <View style={commonStyles.flexRow}>
              <Text style={commonStyles.oneLineKey}>Voucher No</Text>
              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={mainData[2]}
                editable={false} // Disables input
              />
            </View>
            <View style={commonStyles.flexRow}>
              <Text style={commonStyles.oneLineKey}>Remarks</Text>
              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={transName !== 'ModPayment' ? mainData[17] : ''}
                editable={false} // Disables input
              />
            </View>
            {(transValue[3].AC_Payee == 'Y' ||
              transValue[3].AC_Payee == 'N') && (
              <View style={commonStyles.checkBoxContainer}>
                <Checkbox
                  status={
                    transValue[3].AC_Payee == 'Y' ? 'checked' : 'unchecked'
                  } // Set the checkbox to checked
                  onPress={() => {}}
                  disabled={false} // Disables the checkbox
                />
                <Text style={commonStyles.label}>A/C Payee</Text>
              </View>
            )}
            {/* <View style={commonStyles.checkBoxContainer}>
              <Checkbox
                status="unchecked" // Set the checkbox to checked
                onPress={() => {}}
                disabled={true} // Disables the checkbox
              />
              <Text style={commonStyles.label}>A/C Payee</Text>
            </View> */}
            <View style={commonStyles.disableButtonTextContainer}>
              <Text style={commonStyles.disableButtonText}>Account</Text>
            </View>
            {noHeadRemarksblw && (
              <ApprovalTableComponent
                tableData={noHeadRemarksblw}
                highlightVal={['']}
                heading={''}
              />
            )}
            {['rtgs/neft', 'debit card', 'bank transfer', 'g_pay'].includes(
              mainData[7].toLowerCase(),
            ) && (
              <ApprovalTableComponent
                tableData={supplierBankMain}
                highlightVal={['']}
                heading={'Select Supplier Bank'}
              />
            )}
            <View style={commonStyles.disableButtonTextContainer}>
              <Text style={commonStyles.disableButtonText}>Fx Rate</Text>
            </View>
            {/* -------------------------- INR Pending_______________ */}
            <View style={[commonStyles.textCenter, commonStyles.flexRow]}>
              <Text style={commonStyles.heading}>1 {mainData[10]} =</Text>
              <TextInput
                style={[commonStyles.inputNoBox]}
                placeholder="" // Placeholder text
                value={mainData[11].toString()}
                editable={false} // Disables input
              />
              <Text style={commonStyles.heading}>{mainData[9]}</Text>
            </View>
            {/* ---------------------------------------------------- */}
            <View style={commonStyles.flexRow}>
              <Text style={commonStyles.oneLineKey}>Actual Paid</Text>
              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={mainData[6].toString()}
                editable={false} // Disables input
              />
            </View>
            <View style={commonStyles.disableButtonTextContainer}>
              <Text style={commonStyles.disableButtonText}>Calculate</Text>
            </View>
            {mainData[7] === 'Demand Draft' && (
              <View style={commonStyles.padTop}>
                <Text style={commonStyles.oneLineKey}>
                  Demand Draft Details{' '}
                </Text>
              </View>
            )}
            {mainData[7] === 'Cheque' && (
              <View style={commonStyles.padTop}>
                <Text style={commonStyles.oneLineKey}>Cheque Details </Text>
              </View>
            )}
            <View style={commonStyles.flexRow}>
              <Text style={commonStyles.oneLineKey}>
                {mainData[7].toLowerCase() === 'RTGS/NEFT'.toLowerCase()
                  ? 'RTGS/NEFT '
                  : mainData[7].toLowerCase() === 'Bank Transfer'.toLowerCase()
                  ? 'TT '
                  : mainData[7].toLowerCase() === 'Demand Draft'.toLowerCase()
                  ? 'DD '
                  : mainData[7].toLowerCase() === 'MOBILE BANKING'.toLowerCase()
                  ? 'MB '
                  : mainData[7].toLowerCase() === 'Debit Card'.toLowerCase()
                  ? 'DC '
                  : mainData[7].toLowerCase() === 'Credit Card'.toLowerCase()
                  ? 'CC '
                  : mainData[7].toLowerCase() === 'Cheque'.toLowerCase()
                  ? 'Cheque '
                  : mainData[7].toLowerCase() ===
                    'Letter Of Credit'.toLowerCase()
                  ? 'LL '
                  : mainData[7].toLowerCase() === 'NET BANKING'.toLowerCase()
                  ? 'NB '
                  : mainData[7].toLowerCase() === 'G_PAY'.toLowerCase()
                  ? 'GP '
                  : 'Cash '}
                Ref No <Text style={commonStyles.redAsterisk}>*</Text>
              </Text>
              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={transDetails[3].toString()}
                editable={false} // Disables input
              />
            </View>
            {['Demand Draft', 'Debit Card', 'Cheque'].includes(mainData[7]) && (
              <View style={commonStyles.flexRow}>
                <Text style={commonStyles.oneLineKey}>
                  Favour of <Text style={commonStyles.redAsterisk}>*</Text>
                </Text>
                <Text style={commonStyles.oneLineValue}>{transDetails[5]}</Text>
              </View>
            )}
            <View style={commonStyles.flexRow}>
              <Text style={commonStyles.oneLineKey}>
                {mainData[7].toLowerCase() === 'RTGS/NEFT'.toLowerCase()
                  ? 'RTGS/NEFT '
                  : mainData[7].toLowerCase() === 'Bank Transfer'.toLowerCase()
                  ? 'TT '
                  : mainData[7].toLowerCase() === 'Demand Draft'.toLowerCase()
                  ? 'DD '
                  : mainData[7].toLowerCase() === 'MOBILE BANKING'.toLowerCase()
                  ? 'MB '
                  : mainData[7].toLowerCase() === 'Debit Card'.toLowerCase()
                  ? 'DC '
                  : mainData[7].toLowerCase() === 'Credit Card'.toLowerCase()
                  ? 'CC '
                  : mainData[7].toLowerCase() === 'Cheque'.toLowerCase()
                  ? 'Cheque '
                  : mainData[7].toLowerCase() ===
                    'Letter Of Credit'.toLowerCase()
                  ? 'LL '
                  : mainData[7].toLowerCase() === 'NET BANKING'.toLowerCase()
                  ? 'NB '
                  : mainData[7].toLowerCase() === 'G_PAY'.toLowerCase()
                  ? 'GP '
                  : 'Cash '}
                Date
              </Text>
              <Text style={commonStyles.oneLineValue}>
                {DateFormatComma(mainData[1])}
              </Text>
            </View>
            <View style={commonStyles.flexRow}>
              <Text style={commonStyles.oneLineKey}>
                {mainData[7].toLowerCase() === 'RTGS/NEFT'.toLowerCase()
                  ? 'RTGS/NEFT '
                  : mainData[7].toLowerCase() === 'Bank Transfer'.toLowerCase()
                  ? 'TT '
                  : mainData[7].toLowerCase() === 'Demand Draft'.toLowerCase()
                  ? 'DD '
                  : mainData[7].toLowerCase() === 'MOBILE BANKING'.toLowerCase()
                  ? 'MB '
                  : mainData[7].toLowerCase() === 'Debit Card'.toLowerCase()
                  ? 'DC '
                  : mainData[7].toLowerCase() === 'Credit Card'.toLowerCase()
                  ? 'CC '
                  : mainData[7].toLowerCase() === 'Cheque'.toLowerCase()
                  ? 'Cheque '
                  : mainData[7].toLowerCase() ===
                    'Letter Of Credit'.toLowerCase()
                  ? 'LL '
                  : mainData[7].toLowerCase() === 'NET BANKING'.toLowerCase()
                  ? 'NB '
                  : mainData[7].toLowerCase() === 'G_PAY'.toLowerCase()
                  ? 'GP '
                  : 'Cash '}
                Amt ({mainData[9]})
              </Text>
              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={mainData[6].toString()}
                editable={false} // Disables input
              />
            </View>
            <View style={commonStyles.flexColumn}>
              <Text style={commonStyles.oneLineKey}>Amount in words</Text>
              <Text style={commonStyles.oneLineValue}>
                {numToWords || 'Loading...'}
              </Text>
            </View>
            <View style={commonStyles.flexColumn}>
              <Text style={commonStyles.oneLineKey}>Narration</Text>
              <TextInput
                style={[commonStyles.oneLineValue, commonStyles.input]}
                placeholder="" // Placeholder text
                value={transValue[3].COMMENTS}
                editable={false} // Disables input
              />
            </View>
          </ScrollView>
        </>
      )}
      <CustomModal
        isVisible={PDFModalVisible}
        onClose={toggleModalPDF}
        title="Select an Option">
        {/* Children Content */}
        <TouchableOpacity
          onPress={async () => {
            try {
              setIsLoading(true); // Set loading to true before starting the operation
              setPDFModalVisible(false); // Close the modal

              const requestUrl = `${API_URL}/api/approval/payment/billspay_printPdf`;
              // const requestUrl = `${API_URL}/api/approval/payment/billspay_printPdf`;

              const requestBody = {
                tranObject: transValue,
                trans_id: transId,
              };

              // Convert requestBody to a JSON string
              const requestBodyString = JSON.stringify(requestBody);
              console.log('requestBody::', requestBodyString);

              // Await the execution of BlobFetchComponent
              await BlobFetchComponent(requestUrl, requestBodyString,name='Adv_');
            } catch (error) {
              console.error('Error executing BlobFetchComponent:', error);
            } finally {
              // Set loading to false after the operation completes, regardless of success or failure
              setIsLoading(false);
            }
          }}
          style={styles.pdfSubOption}>
          <Text style={styles.subOptionText}>Print PDF</Text>
        </TouchableOpacity>
      </CustomModal>

      <CustomModalWithCloseIcon
        // isVisible={true}
        isVisible={reUseCancel}
        onClose={toggleModalReUse}
        title="Select Cheque Status Below"
        isVisibleClose={false}
        isVisibleCloseIcon={true}>
        <View style={[commonStyles.flexColumn, commonStyles.centerAlign]}>
          <View style={[commonStyles.flexRowNoPadd, commonStyles.centerAlign]}>
            <Text
              style={{
                color: 'black',
                paddingTop: 0,
                marginTop: 0,
                paddingBottom: 10,
                textAlign: 'center', // Ensures text alignment in center
              }}>
              {`Cheque No: ${checkStatus ? checkStatus[0] : 'null'}`}
            </Text>
            {/* <TouchableOpacity
              onPress={toggleModalReUse}
              style={styles.topRightCloseButton}>
              <Icon name="close" size={24} color="black" />
            </TouchableOpacity> */}
          </View>
          <View style={commonStyles.flexRowNoPadd}>
            {/* Children Content */}
            <TouchableOpacity
              onPress={() => {
                updateModRejectPayStatus(
                  transName,
                  paymentId,
                  mainData[8],
                  transDetails[3],
                  mainData[7],
                  transValue,
                  transId,
                  'Re-Use',
                  currentLevel,
                  checkStatus,
                  appRejParams,
                  appRejUrl,
                  action,
                );
                toggleModalReUse();
                navigation.navigate('ApprovalMainScreen');
              }}
              style={[
                styles.pdfSubOption,
                {
                  alignItems: 'center',
                  // width: 170,
                  flex: .5,
                  marginRight: 10,
                  backgroundColor: CustomThemeColors.primary,
                },
              ]}>
              <Text
                style={[
                  styles.subOptionText,
                  {
                    color: 'white',
                    fontSize: DeviceInfo.isTablet() ? 14 : 12,
                    // flex: 1,
                  },
                ]}>
                Re-Use
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                updateModRejectPayStatus(
                  transName,
                  paymentId,
                  mainData[8],
                  transDetails[3],
                  mainData[7],
                  transValue,
                  transId,
                  'Cancelled',
                  currentLevel,
                  checkStatus,
                  appRejParams,
                  appRejUrl,
                  action,
                );
                toggleModalReUse();
                navigation.navigate('ApprovalMainScreen');
              }}
              style={[
                styles.pdfSubOption,
                {
                  alignItems: 'center',
                  // width: 200,
                  flex: .5,
                  backgroundColor: CustomThemeColors.primary,
                },
              ]}>
              <Text
                style={[
                  styles.subOptionText,
                  {color: 'white', fontSize: DeviceInfo.isTablet() ? 14 : 12},
                ]}>
                Cancelled
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModalWithCloseIcon>

      {/* Button to toggle visibility */}
      {!isRefreshing && (
        <>
          <View style={styles.buttonContainer}>
            <CustomButton
              color={'white'}
              fontColor={'black'}
              onPress={handleButtonClick} // Trigger handleButtonClick on press
            >
              Click here for {showInfoPairs ? 'more' : 'less'} info
            </CustomButton>
          </View>
          <View>
            <ApproveRejectComponent
              // approveUrl="http://192.168.0.107:8100/rest/approval/approveTransaction"
              // rejectUrl="http://192.168.0.107:8100/rest/approval/rejectTransaction"
              params={approvalParams}
              approveUrl={`${API_URL}/api/common/approveTransaction`}
              rejectUrl={`${API_URL}/api/common/rejectTransaction`}
              rejParams={rejParams}
              // setRejParams={setRejParams}
              setAppRejParams={setAppRejParams}
              setReUseCancel={setReUseCancel}
              paymentMode={transValue[1]?.['PAYMENT_MODE']}
              setAppRejUrl={setAppRejUrl}
              transName={transName}
              currentLevel={currentLevel}
              totalNoOfLevels={wholedata.noOfLevel}
              transId={transId}
              setAction={setAction}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    justifyContent: 'space-between', // Ensures button is at the bottom
  },
  scrollContainer: {
    flex: 1,
  },
  tableContainer: {
    width: '100%', // Ensure the container takes up full width
    paddingHorizontal: 10, // Optional: padding for aesthetics
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  helloText: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  openButton: {
    backgroundColor: '#3788E5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  openButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalBody: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#3788E5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pdfSubOption: {
    width: DeviceInfo.isTablet() ? 300 : 200,
    padding: 10,
    backgroundColor: 'white',
    paddingHorizontal: 50,
    borderColor: CustomThemeColors.primary,
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 10,
    color: 'black',
  },
  subOptionText: {color: 'black', fontWeight: '400', textAlign: 'center'},
});
