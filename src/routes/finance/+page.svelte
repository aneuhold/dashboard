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
  import { translations as tr } from '../../stores/translations';

  const bankingAndFinanceStorageLinks: Array<LinkInfo> = [
    {
      title: $tr['finance.banking-links.onpoint.title'].value,
      description: $tr['finance.banking-links.onpoint.description'].value,
      clickAction: () => {
        window.open('https://www.onpointcu.com/', '_blank');
      },
      iconName: 'account_balance'
    },
    {
      title: $tr['finance.banking-links.amex.title'].value,
      description: $tr['finance.banking-links.amex.description'].value,
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
      title: $tr['finance.banking-links.robinhood.title'].value,
      description: $tr['finance.banking-links.robinhood.description'].value,
      clickAction: () => {
        window.open('https://robinhood.com/', '_blank');
      },
      iconName: 'trending_up'
    }
  ];

  const debtAndLoansLinks: Array<LinkInfo> = [
    {
      title: $tr['finance.debt-links.student-loan.title'].value,
      description: $tr['finance.debt-links.student-loan.description'].value,
      clickAction: () => {
        window.open($tr['finance.debt-links.student-loan.link'].value, '_blank');
      },
      iconName: 'school'
    },
    {
      title: $tr['finance.debt-links.mortgage.title'].value,
      description: $tr['finance.debt-links.mortgage.description'].value,
      clickAction: () => {
        window.open($tr['finance.debt-links.mortgage.link'].value, '_blank');
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
        <li>Airline miles (this is an easy-to-see benefit)</li>
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
