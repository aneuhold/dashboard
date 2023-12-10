<!--
  @component
  
  A page for Financial info.
-->
<script lang="ts" context="module">
  import { goto } from '$app/navigation';
  import type { PageInfo } from 'util/navInfo';

  export const financePageInfo: PageInfo = {
    shortTitle: 'Finance',
    title: 'Financial Info and Links',
    description: 'General financial information and links',
    url: '/finance',
    iconName: 'attach_money',
    clickAction: () => {
      goto(financePageInfo.url);
    },
    nestingLevel: 0,
    isInternalLink: true
  };
</script>

<script lang="ts">
  import Paper, { Content, Title } from '@smui/paper';
  import LinkList from 'components/LinkList.svelte';
  import type { LinkInfo } from 'components/LinkListItem.svelte';
  import PageTitle from 'components/PageTitle.svelte';

  const bankingAndFinanceStorageLinks: Array<LinkInfo> = [
    {
      title: 'OnPoint Credit Union',
      description:
        'Where all the money be. Nothing else special going on here, or opportunities as far as I know.',
      clickAction: () => {
        window.open('https://www.onpointcu.com/', '_blank');
      },
      iconName: 'account_balance'
    },
    {
      title: 'American Express Credit Card Account',
      description: 'Credit card, which is automatically paid back every month. Used for rewards.',
      clickAction: () => {
        window.open('https://www.americanexpress.com/', '_blank');
      },
      iconName: 'credit_card'
    },
    {
      title: 'YNAB',
      description: 'Budgeting and financial tracking.',
      clickAction: () => {
        window.open('https://app.ynab.com/', '_blank');
      },
      iconName: 'savings'
    },
    {
      title: 'Stocks - RobinHood',
      description:
        'Stocks and investments. $100 is automatically paid every month, but trading is manual.',
      clickAction: () => {
        window.open('https://robinhood.com/', '_blank');
      },
      iconName: 'trending_up'
    }
  ];

  const debtAndLoansLinks: Array<LinkInfo> = [
    {
      title: 'Student Loan Account - Nelnet',
      description:
        'Student loan account, which is automatically paid back every month. This was moved from Great Lakes to Nelnet.',
      clickAction: () => {
        window.open(
          'https://auth.nelnet.com/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fresponse_type%3Dcode%26client_id%3Dmma%26state%3DQWl3di1wYmpnUzlUZW1xeUI2d2xjNDFGSF82YTdGTGhRZFJ6Z2tJZklSSGw3semicolon%25252Fdashboard%26redirect_uri%3Dhttps%253A%252F%252Fsecure.nelnet.com%26scope%3Dopenid%2520offline_access%2520mma.api.read%2520mma.api.write%26code_challenge%3DwFi77rF7RBbo5h-pwGev-ei4cMkHBugEw4PT26gyKeo%26code_challenge_method%3DS256%26nonce%3DQWl3di1wYmpnUzlUZW1xeUI2d2xjNDFGSF82YTdGTGhRZFJ6Z2tJZklSSGw3%26nds_client_id%3D1%26nds_application_id%3D1%26pid%3D_PENDO_T_cbGBDlJ6Fc8',
          '_blank'
        );
      },
      iconName: 'school'
    },
    {
      title: 'Mortgage - Lakeview / Change Management Servicing',
      description: `What this goes through is a tad confusing. They seem to keep changing their name. This is paid automatically though.`,
      clickAction: () => {
        window.open('https://changemtgservicing.com/portal/dashboard', '_blank');
      },
      iconName: 'house'
    }
  ];

  const shoppingLocationLinks: Array<LinkInfo> = [
    {
      title: 'Amazon',
      description: 'For buying anything for the house, presents, or most other things.',
      clickAction: () => {
        window.open('https://www.amazon.com/', '_blank');
      },
      iconName: 'shopping_cart'
    },
    {
      title: 'All Star Health',
      description: 'Supplements and vitamins.',
      clickAction: () => {
        window.open('https://www.allstarhealth.com/', '_blank');
      },
      iconName: 'fitness_center'
    }
  ];

  const shoppingSupportLinks: Array<LinkInfo> = [
    {
      title: 'Google Shopping List',
      description: 'Shopping list for the house. This is shared with Ashley.',
      clickAction: () => {
        window.open('https://shoppinglist.google.com/', '_blank');
      },
      iconName: 'shopping_cart'
    },
    {
      title: 'Gift Cards',
      description: 'Gift cards for various places.',
      clickAction: () => {
        window.open(
          'https://docs.google.com/spreadsheets/d/1MG86022lCCH0fWj43b90CkzG6UU4rwxZwdn2qx5QgA0/edit#gid=0',
          '_blank'
        );
      },
      iconName: 'card_giftcard'
    }
  ];
</script>

<svelte:head>
  <title>{financePageInfo.shortTitle}</title>
  <meta name="description" content={financePageInfo.description} />
</svelte:head>

<PageTitle title={financePageInfo.shortTitle} subtitle={financePageInfo.description} />
<div class="content">
  <Paper>
    <Title>Banking and Financial Storage</Title>
    <Content>
      <LinkList links={bankingAndFinanceStorageLinks} />
      <h6 class="section-title">Credit Card Rewards Strategy</h6>
      <p>
        It would be good to look into this a bit more. Right now there are a few things being done,
        but more could be done. Also notes are needed on the current benefits:
      </p>
      <ul>
        <li>Extra coverage on phones by paying phone bill through card</li>
        <li>Airline miles (this one is easy to see the benefit of)</li>
      </ul>
    </Content>
  </Paper>

  <Paper>
    <Title>Debt and Loans</Title>
    <Content>
      <LinkList links={debtAndLoansLinks} />
      <h6 class="section-title">Mortgage Strategy</h6>
      <p>
        Most of the notes are in the <a
          href="https://tiddlydrive.github.io/?state=%7B%22ids%22:%5B%221ujSre3E0f8HxLW4pqSTh5bFeztEB5zTx%22%5D,%22action%22:%22open%22,%22userId%22:%22112679225576170416987%22%7D#Carpets:Carpets%20Refrigerators%20Appliances%20%5B%5BWater%20Heaters%5D%5D%20%5B%5BHVAC%20Furnace%5D%5D%20%5B%5BHeat%20Exchangers%5D%5D%20%5B%5BHeating%20Ventilation%20and%20Cooling%20(HVAC)%5D%5D%20%5B%5BPlumbing%20Pipes%5D%5D%20%5B%5BPlumbing%20Vent%5D%5D%20%5B%5BPlumbing%20Trap%5D%5D%20Plumbing"
          >home wiki</a
        >, but generally the goal is to refinance. This can't happen right now though because the
        interest rates are so bad. Once the interest rates get better it will be good to look into
        this.
      </p>
    </Content>
  </Paper>

  <Paper>
    <Title>Shopping and Purchases</Title>
    <Content>
      <div class="content">
        <Paper variant="outlined">
          <Title>Places to Buy Things</Title>
          <Content>
            <LinkList links={shoppingLocationLinks} />
          </Content>
        </Paper>
        <Paper variant="outlined">
          <Title>Purchase Support Links</Title>
          <Content>
            <LinkList links={shoppingSupportLinks} />
          </Content>
        </Paper>
      </div>
    </Content>
  </Paper>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .section-title {
    margin-bottom: 0px;
  }
</style>
