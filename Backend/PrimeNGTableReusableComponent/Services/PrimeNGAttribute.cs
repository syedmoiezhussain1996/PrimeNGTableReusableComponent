﻿namespace PrimeNG.Attributes {
    public enum EnumDataType {
        Text,
        Numeric,
        Boolean,
        Date
    }
    public enum EnumDataAlignHorizontal {
        Left,
        Center,
        Right
    }
    public enum EnumDataAlignVertical {
        Top,
        Middle,
        Bottom
    }
    public enum EnumFrozenColumnAlign {
        Noone,
        Left,
        Right
    }
    public enum EnumCellOverflowBehaviour {
        Hidden,
        Wrap/*,
        Ellipsis*/
    }
    /// <summary>
    /// Custom attributes for PrimeNG tables
    /// </summary>
    [AttributeUsage(AttributeTargets.Property, Inherited = false, AllowMultiple = false)]
    sealed class PrimeNGAttribute : Attribute {
        public string Header { get; }
        public EnumDataType DataType { get; }
        public EnumDataAlignHorizontal DataAlignHorizontal { get; }
        public bool DataAlignHorizontalAllowUserEdit { get; }
        public EnumDataAlignVertical DataAlignVertical { get; }
        public bool DataAlignVerticalAllowUserEdit { get; }
        public bool CanBeHidden { get; }
        public bool StartHidden { get; }
        public bool CanBeResized { get; }
        public bool CanBeReordered { get; }
        public bool CanBeSorted { get; }
        public bool CanBeFiltered { get; }
        public string FilterPredifinedValuesName { get; }
        public bool CanBeGlobalFiltered { get; }
        public bool SendColumnAttributes { get; }
        public string ColumnDescription { get; }
        public bool DataTooltipShow { get; }
        public string DataTooltipCustomColumnSource { get; }
        public EnumFrozenColumnAlign FrozenColumnAlign { get; }
        public EnumCellOverflowBehaviour CellOverflowBehaviour { get; }
        public bool CellOverflowBehaviourAllowUserEdit { get; }
        public double InitialWidth { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="PrimeNGAttribute"/> class.
        /// </summary>
        /// <param name="header">The name that will be used to display this column in the table.</param>
        /// <param name="dataType">The data type that will be used for the filter ("text" by default).</param>
        /// <param name="dataAlignHorizontal">The data horizontal alignment for the column ("center" by default).</param>
        /// <param name="dataAlignHorizontalAllowUserEdit">By default true. If true, the user may modify the horizontal aligment.</param>
        /// <param name="dataAlignVertical">The data vertical alignment for the column ("middle" by default).</param>
        /// <param name="dataAlignVerticalAllowUserEdit">By default true. If true, the user may modify the vertical aligment.</param>
        /// <param name="canBeHidden">If <c>true</c>, the column can be hidden.</param>
        /// <param name="startHidden">If <c>true</c>, the column starts hidden (if it can be hidden).</param>
        /// <param name="canBeResized">If <c>true</c>, the column can be resized.</param>
        /// <param name="canBeReordered">If <c>true</c>, the column can be reordered.</param>
        /// <param name="canBeSorted">If <c>true</c>, the column can be sorted.</param>
        /// <param name="canBeFiltered">If <c>true</c>, the column can be filtered.</param>
        /// <param name="filterPredifinedValuesName">The name used on typescript to store the list of allowed values in the dropdown.</param>
        /// <param name="canBeGlobalFiltered">If <c>true</c>, the data can be globally filtered.</param>
        /// <param name="sendColumnAttributes">If <c>true</c>, the column attirbutes will be sent. If <c>false</c> column attributes won't be sent and has to be explicitly declared in PerformDynamicQuery to be sent</param>
        /// <param name="columnDescription">If informed, the column will have an additional icon with a description.</param>
        /// <param name="dataTooltipShow">If <c>true</c>, data in a row when mouse hovers can be shown as tooltip. Useful for long data in a row</param>
        /// <param name="dataTooltipCustomColumnSource">A string that ig given a value, the tooltip will fetch the value from a column name that matches the provided value</param>
        /// <param name="frozenColumnAlign">An enum that indicates if the column is frozen and were it is aligned</param>

        /// <exception cref="ArgumentException">
        /// Thrown if an invalid dataAlign or dataType value is provided.
        /// </exception>
        public PrimeNGAttribute(
            string header = "",
            EnumDataType dataType = EnumDataType.Text,
            EnumDataAlignHorizontal dataAlignHorizontal = EnumDataAlignHorizontal.Center,
            bool dataAlignHorizontalAllowUserEdit = true,
            EnumDataAlignVertical dataAlignVertical = EnumDataAlignVertical.Middle,
            bool dataAlignVerticalAllowUserEdit = true,
            bool canBeHidden = true,
            bool startHidden = false,
            bool canBeResized = true,
            bool canBeReordered = true,
            bool canBeSorted = true,
            bool canBeFiltered = true,
            string filterPredifinedValuesName = "",
            bool canBeGlobalFiltered = true,
            bool sendColumnAttributes = true,
            string columnDescription = "",
            bool dataTooltipShow = true,
            string dataTooltipCustomColumnSource = "",
            EnumFrozenColumnAlign frozenColumnAlign = EnumFrozenColumnAlign.Noone,
            EnumCellOverflowBehaviour cellOverflowBehaviour = EnumCellOverflowBehaviour.Hidden,
            bool cellOverflowBehaviourAllowUserEdit = true,
            double initialWidth = 0

        ) {
            Header = header;
            DataType = dataType;
            DataAlignHorizontal = dataAlignHorizontal;
            DataAlignHorizontalAllowUserEdit = dataAlignHorizontalAllowUserEdit;
            DataAlignVertical = dataAlignVertical;
            DataAlignVerticalAllowUserEdit = dataAlignVerticalAllowUserEdit;
            CanBeHidden = canBeHidden;
            StartHidden = startHidden && canBeHidden;
            CanBeResized = frozenColumnAlign == EnumFrozenColumnAlign.Noone && canBeResized;
            CanBeReordered = canBeReordered && frozenColumnAlign == EnumFrozenColumnAlign.Noone;
            CanBeSorted = canBeSorted;
            CanBeFiltered = canBeFiltered;
            FilterPredifinedValuesName = filterPredifinedValuesName;
            CanBeGlobalFiltered = canBeGlobalFiltered && canBeFiltered && dataType != EnumDataType.Boolean;
            SendColumnAttributes = sendColumnAttributes;
            ColumnDescription = columnDescription;
            DataTooltipShow = dataTooltipShow;
            DataTooltipCustomColumnSource = dataTooltipCustomColumnSource;
            FrozenColumnAlign = frozenColumnAlign;
            CellOverflowBehaviour = dataType == EnumDataType.Boolean ? EnumCellOverflowBehaviour.Hidden : cellOverflowBehaviour;
            CellOverflowBehaviourAllowUserEdit = cellOverflowBehaviourAllowUserEdit && dataType != EnumDataType.Boolean;
            InitialWidth = initialWidth <= 0 && frozenColumnAlign != EnumFrozenColumnAlign.Noone ? 100 : initialWidth;
        }
    }
}