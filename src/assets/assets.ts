import logoCat from "../../cats/logo.svg";
import userCat from "../../cats/user.svg";
import apartmentLogo from "../../logos/apartment.svg";
import bankLogo from "../../logos/bank.svg";
import carLogo from "../../logos/car.svg";
import expensesLogo from "../../logos/expenses.svg";
import fishingNetLogo from "../../logos/fishing-net.svg";
import piggyBankLogo from "../../logos/piggy-bank.svg";
import piratesLogo from "../../logos/pirates.png";

export const catAssets = {
  logo: logoCat,
  user: userCat,
};

export const categoryLogoAssets: Record<string, string> = {
  "pittsburgh-pirates": piratesLogo,
  apartment: apartmentLogo,
  expenses: expensesLogo,
  "honda-crv": carLogo,
  "bank-transfers": bankLogo,
  accounts: piggyBankLogo,
  "account-savings": piggyBankLogo,
  "account-retirement": piggyBankLogo,
};

export const netLogoAsset = fishingNetLogo;
