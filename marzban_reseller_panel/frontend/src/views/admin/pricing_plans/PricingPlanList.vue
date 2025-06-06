<template>
  <div class="pricing-plan-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Service / Pricing Plans</span>
          <el-button type="primary" @click="handleAddPlan">
            <el-icon><Plus /></el-icon> Add Plan
          </el-button>
        </div>
      </template>

      <el-table :data="plansStore.getPlans" v-loading="plansStore.isLoading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="name" label="Plan Name" sortable />
        <el-table-column prop="data_limit_gb" label="Data Limit (GB)" width="180" sortable />
        <el-table-column prop="duration_days" label="Duration (Days)" width="180" sortable />
        <el-table-column prop="price" label="Price" width="120" sortable>
            <template #default="scope">
                {{ formatPrice(scope.row.price) }}
            </template>
        </el-table-column>

        <el-table-column label="Actions" width="180">
          <template #default="scope">
            <el-button size="small" @click="handleEditPlan(scope.row)">
              <el-icon><Edit /></el-icon> Edit
            </el-button>
            <el-popconfirm
              title="Are you sure to delete this plan?"
              confirm-button-text="Yes, Delete"
              @confirm="handleDeletePlan(scope.row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger">
                  <el-icon><Delete /></el-icon> Delete
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="plansStore.getError" class="error-message">
        <el-alert :title="plansStore.getError" type="error" show-icon />
      </div>
    </el-card>

    <!-- Dialog for Add/Edit Plan -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? 'Edit Plan' : 'Add New Plan'"
      width="50%"
      @closed="handleDialogClosed"
    >
      <PricingPlanForm
        v-if="dialogVisible"
        :plan="currentPlan"
        :is-edit-mode="isEditMode"
        @submit="handleFormSubmit"
        @cancel="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminPricingPlansStore } from '@/store/adminPricingPlans';
import PricingPlanForm from '@/components/admin/pricing_plans/PricingPlanForm.vue'; // To be created
import { ElMessage } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';

const plansStore = useAdminPricingPlansStore();

const dialogVisible = ref(false);
const isEditMode = ref(false);
const currentPlan = ref(null);

onMounted(() => {
  plansStore.fetchPlans();
});

const formatPrice = (price) => {
  // Basic price formatting, can be enhanced (e.g., currency symbol, locale)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

const handleAddPlan = () => {
  isEditMode.value = false;
  currentPlan.value = null;
  dialogVisible.value = true;
};

const handleEditPlan = (plan) => {
  isEditMode.value = true;
  currentPlan.value = { ...plan };
  dialogVisible.value = true;
};

const handleDeletePlan = async (planId) => {
  try {
    await plansStore.deletePlan(planId);
    ElMessage.success('Pricing plan deleted successfully.');
  } catch (error) {
    ElMessage.error(plansStore.getError || 'Failed to delete pricing plan.');
  }
};

const handleFormSubmit = async (planData) => {
  try {
    if (isEditMode.value && currentPlan.value) {
      await plansStore.updatePlan(currentPlan.value.id, planData);
      ElMessage.success('Pricing plan updated successfully.');
    } else {
      await plansStore.addPlan(planData);
      ElMessage.success('Pricing plan added successfully.');
    }
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error(plansStore.getError || 'Operation failed.');
  }
};

const handleDialogClosed = () => {
  currentPlan.value = null;
};

</script>

<style scoped>
.pricing-plan-list {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.error-message {
  margin-top: 15px;
}
</style>
