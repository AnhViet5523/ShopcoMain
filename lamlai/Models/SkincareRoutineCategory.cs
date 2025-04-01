using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace lamlai.Models
{
    [Table("SkincareRoutineCategories")]
    public class SkincareRoutineCategory
    {
        [Key]
        public int RoutineCategoryId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string SkinType { get; set; }
        
        [Required]
        [StringLength(100)]
        public string RoutineCategory { get; set; }
        
        public int? ProductId { get; set; }
        
        // Navigation property (optional)
        // [ForeignKey("ProductId")]
        // public virtual Product Product { get; set; }
    }
} 