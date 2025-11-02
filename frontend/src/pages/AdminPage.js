import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { foodAPI, userAPI } from '../utils/api';

const DEFAULT_FOOD_FORM = {
	name: '',
	description: '',
	category: 'grains',
	servingSize: {
		amount: '',
		unit: 'g',
		description: '',
	},
	nutrition: {
		calories: '',
		protein: '',
		carbs: {
			total: '',
			fiber: '',
			sugar: '',
		},
		fat: {
			total: '',
			saturated: '',
			trans: '',
		},
	},
	isCommon: false,
	isVerified: false,
};

const HEALTH_CONDITION_LABELS = {
	diabetes: 'Diabetes',
	high_blood_pressure: 'High Blood Pressure',
	high_cholesterol: 'High Cholesterol',
	obesity: 'Obesity',
	pcos_pcod: 'PCOS/PCOD',
	thyroid_disorders: 'Thyroid Disorders',
	heart_disease: 'Heart Disease',
	kidney_issues: 'Kidney Issues',
	pregnancy_nursing: 'Pregnancy/Nursing',
	celiac_gluten_free: 'Celiac / Gluten-Free',
	lactose_intolerance: 'Lactose Intolerance',
	vegetarian: 'Vegetarian',
	vegan: 'Vegan',
};

const cloneFoodForm = () => JSON.parse(JSON.stringify(DEFAULT_FOOD_FORM));

const formatFitnessGoal = (goal) => {
	switch (goal) {
		case 'weight_loss':
			return 'Weight Loss';
		case 'weight_gain':
			return 'Weight Gain';
		case 'muscle_building':
			return 'Muscle Building';
		case 'maintenance':
			return 'Maintenance';
		default:
			return 'N/A';
	}
};

const formatLocation = (location) => {
	if (!location) {
		return 'N/A';
	}

	const parts = [location.area, location.landmark, location.district, location.state]
		.filter(Boolean)
		.map((part) => part.trim())
		.filter((part) => part.length > 0);

	return parts.length > 0 ? parts.join(', ') : 'N/A';
};

const parseNumber = (value, fallback = 0) => {
	if (value === '' || value === null || value === undefined) {
		return fallback;
	}
	const numeric = Number(value);
	return Number.isNaN(numeric) ? fallback : numeric;
};

const AdminPage = () => {
	const { user } = useAuth();

	const [activeTab, setActiveTab] = useState('users');

	const [foods, setFoods] = useState([]);
	const [foodLoading, setFoodLoading] = useState(false);
	const [foodSaving, setFoodSaving] = useState(false);
	const [foodSearch, setFoodSearch] = useState('');
	const [foodPage, setFoodPage] = useState(1);
	const [foodTotalPages, setFoodTotalPages] = useState(1);
	const [foodModalOpen, setFoodModalOpen] = useState(false);
	const [editingFood, setEditingFood] = useState(null);
	const [foodForm, setFoodForm] = useState(cloneFoodForm());

	const [users, setUsers] = useState([]);
	const [userLoading, setUserLoading] = useState(false);
	const [userSearch, setUserSearch] = useState('');
	const [userPage, setUserPage] = useState(1);
	const [userTotalPages, setUserTotalPages] = useState(1);

	const foodQuery = useMemo(
		() => ({
			page: foodPage,
			limit: 20,
			search: foodSearch.trim() || undefined,
		}),
		[foodPage, foodSearch]
	);

	const userQuery = useMemo(
		() => ({
			page: userPage,
			limit: 20,
			search: userSearch.trim() || undefined,
		}),
		[userPage, userSearch]
	);

	const fetchFoods = useCallback(async () => {
		setFoodLoading(true);
		try {
			const response = await foodAPI.getFoods(foodQuery);
			setFoods(response.data.foodItems || []);
			setFoodTotalPages(response.data.pages || 1);
		} catch (error) {
			console.error('Failed to load foods', error);
			setFoods([]);
			setFoodTotalPages(1);
		} finally {
			setFoodLoading(false);
		}
	}, [foodQuery]);

	const fetchUsers = useCallback(async () => {
		setUserLoading(true);
		try {
			const response = await userAPI.getAllUsers(userQuery);
			setUsers(response.data.users || []);
			setUserTotalPages(response.data.pages || 1);
		} catch (error) {
			console.error('Failed to load users', error);
			setUsers([]);
			setUserTotalPages(1);
		} finally {
			setUserLoading(false);
		}
	}, [userQuery]);

	useEffect(() => {
		if (!user?.isAdmin) {
			return;
		}
		if (activeTab === 'foods') {
			fetchFoods();
		}
	}, [user, activeTab, fetchFoods]);

	useEffect(() => {
		if (!user?.isAdmin) {
			return;
		}
		if (activeTab === 'users') {
			fetchUsers();
		}
	}, [user, activeTab, fetchUsers]);

	const handleFoodFieldChange = (event) => {
		const { name, value, type, checked } = event.target;
		const nextValue = type === 'checkbox' ? checked : value;

		setFoodForm((prev) => {
			if (name.startsWith('servingSize.')) {
				const key = name.split('.')[1];
				return {
					...prev,
					servingSize: {
						...prev.servingSize,
						[key]: nextValue,
					},
				};
			}

			if (name.startsWith('nutrition.')) {
				const parts = name.split('.');
				if (parts.length === 2) {
					return {
						...prev,
						nutrition: {
							...prev.nutrition,
							[parts[1]]: nextValue,
						},
					};
				}

				if (parts.length === 3) {
					const section = parts[1];
					const key = parts[2];
					return {
						...prev,
						nutrition: {
							...prev.nutrition,
							[section]: {
								...prev.nutrition[section],
								[key]: nextValue,
							},
						},
					};
				}
			}

			return {
				...prev,
				[name]: nextValue,
			};
		});
	};

	const openCreateFoodModal = () => {
		setFoodForm(cloneFoodForm());
		setEditingFood(null);
		setFoodModalOpen(true);
	};

	const openEditFoodModal = (food) => {
		setEditingFood(food);
		setFoodForm({
			name: food.name || '',
			description: food.description || '',
			category: food.category || 'grains',
			servingSize: {
				amount: food.servingSize?.amount ?? '',
				unit: food.servingSize?.unit || 'g',
				description: food.servingSize?.description || '',
			},
			nutrition: {
				calories: food.nutrition?.calories ?? '',
				protein: food.nutrition?.protein ?? '',
				carbs: {
					total: food.nutrition?.carbs?.total ?? '',
					fiber: food.nutrition?.carbs?.fiber ?? '',
					sugar: food.nutrition?.carbs?.sugar ?? '',
				},
				fat: {
					total: food.nutrition?.fat?.total ?? '',
					saturated: food.nutrition?.fat?.saturated ?? '',
					trans: food.nutrition?.fat?.trans ?? '',
				},
			},
			isCommon: Boolean(food.isCommon),
			isVerified: Boolean(food.isVerified),
		});
		setFoodModalOpen(true);
	};

	const closeFoodModal = () => {
		setFoodModalOpen(false);
		setEditingFood(null);
		setFoodForm(cloneFoodForm());
	};

	const handleFoodSubmit = async (event) => {
		event.preventDefault();
		setFoodSaving(true);

		const payload = {
			...foodForm,
			servingSize: {
				amount: parseNumber(foodForm.servingSize.amount),
				unit: foodForm.servingSize.unit,
				description: foodForm.servingSize.description,
			},
			nutrition: {
				calories: parseNumber(foodForm.nutrition.calories),
				protein: parseNumber(foodForm.nutrition.protein),
				carbs: {
					total: parseNumber(foodForm.nutrition.carbs.total),
					fiber: parseNumber(foodForm.nutrition.carbs.fiber),
					sugar: parseNumber(foodForm.nutrition.carbs.sugar),
				},
				fat: {
					total: parseNumber(foodForm.nutrition.fat.total),
					saturated: parseNumber(foodForm.nutrition.fat.saturated),
					trans: parseNumber(foodForm.nutrition.fat.trans),
				},
			},
		};

		try {
			if (editingFood) {
				await foodAPI.updateFood(editingFood._id, payload);
			} else {
				await foodAPI.createFood(payload);
			}
			closeFoodModal();
			fetchFoods();
		} catch (error) {
			console.error('Failed to save food item', error);
			alert('Unable to save food item. Please try again.');
		} finally {
			setFoodSaving(false);
		}
	};

	const handleFoodDelete = async (foodId) => {
		if (!window.confirm('Delete this food item?')) {
			return;
		}

		try {
			await foodAPI.deleteFood(foodId);
			fetchFoods();
		} catch (error) {
			console.error('Failed to delete food item', error);
			alert('Unable to delete food item. Please try again.');
		}
	};

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		if (tab === 'foods') {
			setFoodPage(1);
		} else {
			setUserPage(1);
		}
	};

	const handleFoodSearchChange = (value) => {
		setFoodSearch(value);
		setFoodPage(1);
	};

	const handleUserSearchChange = (value) => {
		setUserSearch(value);
		setUserPage(1);
	};

	if (!user?.isAdmin) {
		return (
			<Layout>
				<div className="card text-center py-12">
					<h2 className="text-2xl font-bold text-red-600 mb-4">Access denied</h2>
					<p className="text-gray-600">You do not have permission to view this page.</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
					<p className="text-gray-600">
						{activeTab === 'users' ? 'Monitor user accounts' : 'Manage food database'}
					</p>
				</div>					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-end">
						<div className="inline-flex rounded-md shadow-sm" role="group">
							<button
								type="button"
								onClick={() => handleTabChange('users')}
								className={`px-4 py-2 text-sm font-medium border ${
									activeTab === 'users'
										? 'bg-primary-600 text-white border-primary-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								} rounded-l-md`}
							>
								Users
							</button>
							<button
								type="button"
								onClick={() => handleTabChange('foods')}
								className={`px-4 py-2 text-sm font-medium border ${
									activeTab === 'foods'
										? 'bg-primary-600 text-white border-primary-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								} rounded-r-md`}
							>
								Food database
							</button>
						</div>

						{activeTab === 'foods' && (
							<button onClick={openCreateFoodModal} className="btn-primary">
								+ Add food item
							</button>
						)}
					</div>
				</div>

				{activeTab === 'users' ? (
					<>
						<div className="card">
							<input
								type="text"
								value={foodSearch}
								onChange={(event) => handleFoodSearchChange(event.target.value)}
								placeholder="Search food items..."
								className="input-field"
							/>
						</div>

						<div className="card">
							{foodLoading && foods.length === 0 ? (
								<div className="text-center py-12">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
								</div>
							) : foods.length === 0 ? (
								<div className="text-center py-12 text-gray-500">
									<p>No food items found</p>
								</div>
							) : (
								<>
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Name
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Category
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Serving
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Calories
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Status
													</th>
													<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
														Actions
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{foods.map((food) => (
													<tr key={food._id}>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">{food.name}</div>
															{food.description && (
																<div className="text-sm text-gray-500">{food.description}</div>
															)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
																{food.category}
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{food.servingSize?.amount} {food.servingSize?.unit}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{food.nutrition?.calories} cal
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="flex gap-2">
																{food.isCommon && (
																	<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
																		Common
																	</span>
																)}
																{food.isVerified && (
																	<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
																		Verified
																	</span>
																)}
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
															<button
																onClick={() => openEditFoodModal(food)}
																className="text-primary-600 hover:text-primary-900 mr-4"
															>
																Edit
															</button>
															<button
																onClick={() => handleFoodDelete(food._id)}
																className="text-red-600 hover:text-red-900"
															>
																Delete
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{foodLoading && foods.length > 0 && (
										<p className="text-xs text-gray-400 mt-3 text-right">Refreshing...</p>
									)}
								</>
							)}
						</div>

						{foodTotalPages > 1 && (
							<div className="flex justify-center gap-2 mt-6">
								<button
									onClick={() => setFoodPage(Math.max(1, foodPage - 1))}
									disabled={foodPage === 1}
									className="btn-secondary disabled:opacity-50"
								>
									Previous
								</button>
								<span className="px-4 py-2 text-gray-700">
									Page {foodPage} of {foodTotalPages}
								</span>
								<button
									onClick={() => setFoodPage(Math.min(foodTotalPages, foodPage + 1))}
									disabled={foodPage === foodTotalPages}
									className="btn-secondary disabled:opacity-50"
								>
									Next
								</button>
							</div>
						)}

						{foodModalOpen && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
								<div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
									<div className="p-6">
										<div className="flex justify-between items-center mb-6">
											<h2 className="text-2xl font-bold">
												{editingFood ? 'Edit food item' : 'Add new food item'}
											</h2>
											<button onClick={closeFoodModal} className="text-gray-500 hover:text-gray-700">
												<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>

										<form onSubmit={handleFoodSubmit} className="space-y-6">
											<div className="grid md:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
													<input
														type="text"
														name="name"
														value={foodForm.name}
														onChange={handleFoodFieldChange}
														className="input-field"
														required
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
													<select
														name="category"
														value={foodForm.category}
														onChange={handleFoodFieldChange}
														className="input-field"
														required
													>
														<option value="grains">Grains</option>
														<option value="proteins">Proteins</option>
														<option value="vegetables">Vegetables</option>
														<option value="fruits">Fruits</option>
														<option value="dairy">Dairy</option>
														<option value="fats">Fats</option>
														<option value="sweets">Sweets</option>
														<option value="beverages">Beverages</option>
														<option value="other">Other</option>
													</select>
												</div>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
												<input
													type="text"
													name="description"
													value={foodForm.description}
													onChange={handleFoodFieldChange}
													className="input-field"
												/>
											</div>

											<div>
												<h3 className="font-semibold mb-3">Serving size</h3>
												<div className="grid md:grid-cols-3 gap-4">
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
														<input
															type="number"
															step="0.1"
															name="servingSize.amount"
															value={foodForm.servingSize.amount}
															onChange={handleFoodFieldChange}
															className="input-field"
															required
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
														<input
															type="text"
															name="servingSize.unit"
															value={foodForm.servingSize.unit}
															onChange={handleFoodFieldChange}
															className="input-field"
															required
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
														<input
															type="text"
															name="servingSize.description"
															value={foodForm.servingSize.description}
															onChange={handleFoodFieldChange}
															className="input-field"
															placeholder="e.g., 1 cup"
														/>
													</div>
												</div>
											</div>

											<div>
												<h3 className="font-semibold mb-3">Nutrition (per serving)</h3>
												<div className="grid md:grid-cols-2 gap-4">
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Calories *</label>
														<input
															type="number"
															step="0.1"
															name="nutrition.calories"
															value={foodForm.nutrition.calories}
															onChange={handleFoodFieldChange}
															className="input-field"
															required
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Protein (g) *</label>
														<input
															type="number"
															step="0.1"
															name="nutrition.protein"
															value={foodForm.nutrition.protein}
															onChange={handleFoodFieldChange}
															className="input-field"
															required
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g) *</label>
														<input
															type="number"
															step="0.1"
															name="nutrition.carbs.total"
															value={foodForm.nutrition.carbs.total}
															onChange={handleFoodFieldChange}
															className="input-field"
															required
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Fiber (g)</label>
														<input
															type="number"
															step="0.1"
															name="nutrition.carbs.fiber"
															value={foodForm.nutrition.carbs.fiber}
															onChange={handleFoodFieldChange}
															className="input-field"
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Sugar (g)</label>
														<input
															type="number"
															step="0.1"
															name="nutrition.carbs.sugar"
															value={foodForm.nutrition.carbs.sugar}
															onChange={handleFoodFieldChange}
															className="input-field"
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Total fat (g) *</label>
														<input
															type="number"
															step="0.1"
															name="nutrition.fat.total"
															value={foodForm.nutrition.fat.total}
															onChange={handleFoodFieldChange}
															className="input-field"
															required
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Saturated fat (g)</label>
														<input
															type="number"
															step="0.1"
															name="nutrition.fat.saturated"
															value={foodForm.nutrition.fat.saturated}
															onChange={handleFoodFieldChange}
															className="input-field"
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">Trans fat (g)</label>
														<input
															type="number"
															step="0.1"
															name="nutrition.fat.trans"
															value={foodForm.nutrition.fat.trans}
															onChange={handleFoodFieldChange}
															className="input-field"
														/>
													</div>
												</div>
											</div>

											<div className="grid md:grid-cols-2 gap-4">
												<label className="flex items-center gap-3">
													<input
														type="checkbox"
														name="isCommon"
														checked={foodForm.isCommon}
														onChange={handleFoodFieldChange}
														className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
													/>
													<span className="text-sm text-gray-700">Mark as common</span>
												</label>
												<label className="flex items-center gap-3">
													<input
														type="checkbox"
														name="isVerified"
														checked={foodForm.isVerified}
														onChange={handleFoodFieldChange}
														className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
													/>
													<span className="text-sm text-gray-700">Mark as verified</span>
												</label>
											</div>

											<div className="flex justify-end gap-3">
												<button type="button" onClick={closeFoodModal} className="btn-secondary">
													Cancel
												</button>
												<button type="submit" className="btn-primary" disabled={foodSaving}>
													{foodSaving ? 'Saving...' : editingFood ? 'Update food' : 'Create food'}
												</button>
											</div>
										</form>
									</div>
								</div>
							</div>
						)}
					</>
				) : activeTab === 'foods' ? (
					<>
						<div className="card">
							<input
								type="text"
								value={userSearch}
								onChange={(event) => handleUserSearchChange(event.target.value)}
								placeholder="Search users by name or email..."
								className="input-field"
							/>
						</div>

						<div className="card">
							{userLoading && users.length === 0 ? (
								<div className="text-center py-12">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
								</div>
							) : users.length === 0 ? (
								<div className="text-center py-12 text-gray-500">
									<p>No users found</p>
								</div>
							) : (
								<>
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														User
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Goal & BMI
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Health conditions
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Location
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Last Login
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{users.map((account) => (
													<tr key={account._id}>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900 flex items-center gap-2">
																{account.name || 'Unnamed user'}
																{account.isAdmin && (
																	<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
																		Admin
																	</span>
																)}
															</div>
															<div className="text-sm text-gray-500">{account.email}</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
															<div>{formatFitnessGoal(account.fitnessGoal)}</div>
															<div className="text-xs text-gray-500">
																BMI: {account.bmi ? `${account.bmi} (${account.bmiCategory || 'N/A'})` : 'N/A'}
															</div>
															{account.dailyCalories && (
																<div className="text-xs text-gray-500">TDEE: {account.dailyCalories} kcal</div>
															)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
															{account.healthConditions?.length ? (
																<div className="flex flex-wrap gap-2">
																	{account.healthConditions.map((condition) => (
																		<span
																			key={`${account._id}-${condition}`}
																			className="px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-slate-100 text-slate-700"
																		>
																			{HEALTH_CONDITION_LABELS[condition] || condition}
																		</span>
																	))}
																</div>
															) : (
																<span className="text-xs text-gray-500">None listed</span>
															)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
															{formatLocation(account.location)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
															{account.lastLogin ? (
																<>
																	<div>{new Date(account.lastLogin).toLocaleDateString()}</div>
																	<div className="text-xs text-gray-500">
																		{new Date(account.lastLogin).toLocaleTimeString()}
																	</div>
																</>
															) : (
																'Never'
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{userLoading && (
										<p className="text-xs text-gray-400 mt-3 text-right">Refreshing...</p>
									)}
								</>
							)}
						</div>

						{userTotalPages > 1 && (
							<div className="flex justify-center gap-2 mt-6">
								<button
									onClick={() => setUserPage(Math.max(1, userPage - 1))}
									disabled={userPage === 1}
									className="btn-secondary disabled:opacity-50"
								>
									Previous
								</button>
								<span className="px-4 py-2 text-gray-700">
									Page {userPage} of {userTotalPages}
								</span>
								<button
									onClick={() => setUserPage(Math.min(userTotalPages, userPage + 1))}
									disabled={userPage === userTotalPages}
									className="btn-secondary disabled:opacity-50"
								>
									Next
								</button>
							</div>
						)}
					</>
				) : null}
			</div>
		</Layout>
	);
};

export default AdminPage;

