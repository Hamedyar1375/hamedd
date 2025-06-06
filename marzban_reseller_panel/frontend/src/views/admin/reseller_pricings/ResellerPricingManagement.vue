<template>
  <div class="reseller-pricing-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Reseller-Specific Pricing Management</span>
        </div>
      </template>

      <!-- Reseller Selection -->
      <el-form :inline="true" @submit.prevent style="margin-bottom: 20px;">
        <el-form-item label="Select Reseller:">
          <el-select
            v-model="selectedResellerId"
            placeholder="Choose a reseller"
            filterable
            @change="handleResellerSelected"
            style="width: 300px;"
            :loading="resellersStore.isLoading"
          >
            <el-option
              v-for="reseller in resellersStore.getResellers"
              :key="reseller.id"
              :label="`${reseller.username} (ID: ${reseller.id})`"
              :value="reseller.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div v-if="!selectedResellerId">
        <el-empty description="Please select a reseller to manage their pricing." />
      </div>

      <!-- Pricing Table for Selected Reseller -->
      <div v-if="selectedResellerId" v-loading="isLoadingViewData">
         <el-alert
          v-if="pricingOverridesStore.getError"
          :title="pricingOverridesStore.getError"
          type="error"
          show-icon
          closable
          style="margin-bottom: 15px;"
        />
        <el-table :data="mergedPlans" style="width: 100%">
          <el-table-column prop="name" label="Plan Name" sortable />
          <el-table-column label="Default Price">
            <template #default="scope">{{ formatPrice(scope.row.default_price) }}</template>
          </el-table-column>
          <el-table-column label="Reseller Price">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.custom_price_input"
                :min="0"
                :precision="2"
                :step="0.01"
                placeholder="Default"
                size="small"
                style="width: 120px;"
              />
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="200">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleSetPrice(scope.row)"
                :disabled="scope.row.custom_price_input === undefined || scope.row.custom_price_input === null || scope.row.custom_price_input < 0"
                :loading="pricingOverridesStore.isLoading && currentEditingPlanId === scope.row.id"
              >
                Save
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click="handleClearOverride(scope.row)"
                :disabled="!scope.row.override_id"
                 :loading="pricingOverridesStore.isLoading && currentEditingPlanId === scope.row.id"
              >
                Clear
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <p v-if="!globalPlansStore.getPlans.length && !globalPlansStore.isLoading" style="text-align: center; margin-top: 20px;">
            No global pricing plans found. Please add plans in the "Pricing Plans" section first.
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAdminResellersStore } from '@/store/adminResellers';
import { useAdminPricingPlansStore } from '@/store/adminPricingPlans';
import { useAdminResellerPricingsStore } from '@/store/adminResellerPricings';
import { ElMessage } from 'element-plus';

const resellersStore = useAdminResellersStore();
const globalPlansStore = useAdminPricingPlansStore();
const pricingOverridesStore = useAdminResellerPricingsStore();

const selectedResellerId = ref(null);
const currentEditingPlanId = ref(null); // To show loading on specific row

const isLoadingViewData = computed(() => {
    return resellersStore.isLoading || globalPlansStore.isLoading || (selectedResellerId.value && pricingOverridesStore.isLoading && !currentEditingPlanId.value);
});


onMounted(async () => {
  await resellersStore.fetchResellers();
  await globalPlansStore.fetchPlans();
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

const mergedPlans = computed(() => {
  if (!selectedResellerId.value) return [];

  const resellerPricingsMap = new Map();
  pricingOverridesStore.getPricingsForCurrentReseller.forEach(override => {
    resellerPricingsMap.set(override.pricing_plan_id, {
        custom_price: override.custom_price,
        override_id: override.id // ID of the reseller_pricing record
    });
  });

  return globalPlansStore.getPlans.map(plan => {
    const override = resellerPricingsMap.get(plan.id);
    return {
      ...plan,
      id: plan.id, // Ensure plan.id is used as the key identifier for the plan
      default_price: plan.price,
      custom_price_input: override ? override.custom_price : undefined, // For el-input-number (undefined shows placeholder)
      current_custom_price: override ? override.custom_price : undefined, // Actual current custom price
      override_id: override ? override.override_id : null,
    };
  });
});

watch(selectedResellerId, (newResellerId) => {
  if (newResellerId) {
    pricingOverridesStore.fetchPricingsForReseller(newResellerId);
  } else {
    pricingOverridesStore.clearCurrentResellerPricings();
  }
});

const handleResellerSelected = (resellerId) => {
  // This is handled by the watcher now.
  // console.log('Reseller selected:', resellerId);
};

const handleSetPrice = async (planRow) => {
  if (planRow.custom_price_input === undefined || planRow.custom_price_input === null || planRow.custom_price_input < 0) {
    ElMessage.warning('Please enter a valid price (0 or greater).');
    // Restore input if it was previously defined
    planRow.custom_price_input = planRow.current_custom_price;
    return;
  }
  currentEditingPlanId.value = planRow.id;
  try {
    await pricingOverridesStore.setResellerPricing(
      selectedResellerId.value,
      planRow.id, // This is pricing_plan_id
      planRow.custom_price_input
    );
    ElMessage.success(`Custom price for "${planRow.name}" saved.`);
  } catch (error) {
    ElMessage.error(pricingOverridesStore.getError || 'Failed to save price.');
     // Restore input on error to reflect actual stored state
    planRow.custom_price_input = planRow.current_custom_price;
  } finally {
    currentEditingPlanId.value = null;
  }
};

const handleClearOverride = async (planRow) => {
  if (!planRow.override_id) {
    ElMessage.info('No custom price to clear for this plan.');
    planRow.custom_price_input = undefined; // Clear input field
    return;
  }
  currentEditingPlanId.value = planRow.id;
  try {
    await pricingOverridesStore.deleteResellerPricing(planRow.override_id, selectedResellerId.value);
    ElMessage.success(`Custom price for "${planRow.name}" cleared.`);
    // The fetchPricingsForReseller in delete action will update the view.
    // Or, optimistically update UI:
    // planRow.custom_price_input = undefined;
    // planRow.override_id = null;
  } catch (error) {
    ElMessage.error(pricingOverridesStore.getError || 'Failed to clear price.');
  } finally {
    currentEditingPlanId.value = null;
  }
};

</script>

<style scoped>
.reseller-pricing-management {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
